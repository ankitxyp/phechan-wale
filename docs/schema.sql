-- ============================================================
-- PEHCHAN WALE — Universal O2O Super App
-- Database Schema v2 for Supabase (PostgreSQL)
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================
-- ⚠️  This replaces the old schema.sql completely.
--     Drop old tables first if they exist.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- CLEANUP (safe to run on fresh DB)
-- ────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.reservations      CASCADE;
DROP TABLE IF EXISTS public.bids_and_deals    CASCADE;
DROP TABLE IF EXISTS public.customer_requests CASCADE;
DROP TABLE IF EXISTS public.listings          CASCADE;
DROP TABLE IF EXISTS public.profiles          CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;


-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
--    Every user on the platform: buyer, seller, mechanic,
--    farmer, agent — all in one table.
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id           UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  avatar_url        TEXT,
  bio               TEXT,

  -- Roles (a user can hold multiple roles)
  roles             TEXT[] NOT NULL DEFAULT '{"buyer"}',
    -- Valid values: buyer, seller, mechanic, farmer, agent

  -- Trust & Reputation
  pehchan_score     SMALLINT NOT NULL DEFAULT 50
                    CHECK (pehchan_score >= 0 AND pehchan_score <= 100),
    -- 0 = untrusted, 100 = legendary local. Starts at 50.

  -- Wallet (agent commissions, refunds, earnings)
  wallet_balance    NUMERIC(12, 2) NOT NULL DEFAULT 0.00,

  -- Agent-specific
  is_agent_verified BOOLEAN NOT NULL DEFAULT false,

  -- Location (lat/lng for fast geo queries)
  location_lat      DOUBLE PRECISION,
  location_lng      DOUBLE PRECISION,
  location_label    TEXT,              -- e.g. "Boring Road, Patna"

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles IS 'Universal user table — buyers, sellers, mechanics, farmers, agents.';
COMMENT ON COLUMN public.profiles.pehchan_score IS '0–100 trust score. Higher = more trusted in the community.';
COMMENT ON COLUMN public.profiles.roles IS 'Array of roles: buyer, seller, mechanic, farmer, agent. A user can have multiple.';
COMMENT ON COLUMN public.profiles.wallet_balance IS 'In-app wallet for commissions, earnings, and reservation refunds.';


-- ────────────────────────────────────────────────────────────
-- 2. LISTINGS
--    Universal table for everything being sold or offered.
--    Products, services, food, bulk — all in one table.
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Type & Category
  item_type         TEXT NOT NULL CHECK (item_type IN ('product', 'service', 'food', 'bulk')),
    -- product: kirana, electronics, hardware
    -- service: plumber, electrician, painter
    -- food:    restaurant, tiffin, street food
    -- bulk:    farmer produce, wholesale

  category          TEXT NOT NULL,       -- e.g. "grocery", "electronics", "plumbing"

  -- Details
  title             TEXT NOT NULL,
  description       TEXT,
  price             NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  image_url         TEXT,
  image_urls        TEXT[],              -- multiple images for rich listings

  -- Stock / MOQ (for bulk & farmers)
  stock_or_moq      TEXT,                -- e.g. "100 kg available", "Min 2 kg"
  unit              TEXT,                -- e.g. "kg", "piece", "litre", "per visit"

  -- Compare vs online
  online_price      NUMERIC(12, 2),      -- optional: the Amazon/Flipkart price for comparison

  -- Monetisation
  is_promoted_ad    BOOLEAN NOT NULL DEFAULT false,
    -- Sellers pay to boost. Your ad revenue model.

  is_available      BOOLEAN NOT NULL DEFAULT true,

  -- Location (where to pick up / service area)
  location_lat      DOUBLE PRECISION,
  location_lng      DOUBLE PRECISION,
  location_label    TEXT,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.listings IS 'Universal listing table — products, services, food, bulk/farmer goods.';
COMMENT ON COLUMN public.listings.item_type IS 'Discriminator: product | service | food | bulk.';
COMMENT ON COLUMN public.listings.stock_or_moq IS 'Free text for stock/MOQ. e.g. "100 kg available" or "5 left".';
COMMENT ON COLUMN public.listings.is_promoted_ad IS 'Boosted listing — paid promotion by the seller.';
COMMENT ON COLUMN public.listings.online_price IS 'Optional Amazon/Flipkart price so customers can see the savings.';


-- ────────────────────────────────────────────────────────────
-- 3. CUSTOMER REQUESTS
--    Users upload a photo of their problem (broken TV,
--    leaking pipe) and get bids from local providers.
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.customer_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Problem details
  problem_image_url   TEXT,              -- photo of the issue
  description         TEXT NOT NULL,     -- "My ceiling fan stopped, makes humming sound"

  -- AI-assisted estimate (filled by backend/AI)
  ai_estimated_price  NUMERIC(10, 2),
  ai_category         TEXT,              -- AI-detected category: "electrician", "plumber"

  -- Workflow
  status              TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'bidding', 'assigned', 'solved', 'cancelled')),
    -- open     → just posted, waiting for bids
    -- bidding  → bids are coming in
    -- assigned → customer accepted a bid
    -- solved   → work done
    -- cancelled

  -- Location
  location_lat        DOUBLE PRECISION,
  location_lng        DOUBLE PRECISION,
  location_label      TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.customer_requests IS 'Problem reports from customers seeking local help via community bids.';
COMMENT ON COLUMN public.customer_requests.ai_estimated_price IS 'Optional AI-generated price estimate to help customers judge bids.';


-- ────────────────────────────────────────────────────────────
-- 4. BIDS AND DEALS
--    Providers (mechanics, painters, etc.) submit offers
--    on customer requests. Customer picks the best one.
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.bids_and_deals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id        UUID NOT NULL REFERENCES public.customer_requests(id) ON DELETE CASCADE,
  provider_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Offer
  offered_price     NUMERIC(10, 2) NOT NULL CHECK (offered_price >= 0),
  message           TEXT,                -- "I can fix this today. I have the spare part."
  voice_note_url    TEXT,                -- optional voice note for a personal touch
  estimated_time    TEXT,                -- "30 minutes", "same day", "tomorrow"

  -- Status
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'disputed')),

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate bids from same provider on same request
  UNIQUE (request_id, provider_id)
);

COMMENT ON TABLE  public.bids_and_deals IS 'Provider bids on customer problem requests. Customer picks the winner.';
COMMENT ON COLUMN public.bids_and_deals.voice_note_url IS 'Optional voice message — adds trust and a personal touch.';
COMMENT ON COLUMN public.bids_and_deals.estimated_time IS 'Free text ETA: "30 min", "today", "tomorrow morning".';


-- ────────────────────────────────────────────────────────────
-- 5. RESERVATIONS
--    Customer pays ₹10 to "hold" a product before walking
--    to the shop. Prevents wasted trips.
-- ────────────────────────────────────────────────────────────

CREATE TABLE public.reservations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Fee
  reservation_fee   NUMERIC(6, 2) NOT NULL DEFAULT 10.00,
    -- Standard ₹10 hold fee. Adjustable per listing if needed.

  -- Status
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'picked_up', 'expired', 'cancelled', 'refunded')),
    -- active   → reserved, customer is on the way
    -- picked_up → customer collected the item
    -- expired  → customer didn't show up
    -- cancelled → customer cancelled before expiry
    -- refunded → fee returned to wallet

  -- Expiry (auto-expire if not picked up)
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 hours'),

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent double-reserving same listing by same customer
  UNIQUE (listing_id, customer_id)
);

COMMENT ON TABLE  public.reservations IS 'Hold/reserve a product at ₹10 before walking to the shop.';
COMMENT ON COLUMN public.reservations.reservation_fee IS 'Small fee (default ₹10) to prevent no-shows.';
COMMENT ON COLUMN public.reservations.expires_at IS 'Auto-expire if customer does not pick up within this window.';


-- ============================================================
-- AUTO-UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_listings
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_customer_requests
  BEFORE UPDATE ON public.customer_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- INDEXES — Optimised for the key query patterns
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_phone       ON public.profiles(phone);
CREATE INDEX idx_profiles_roles       ON public.profiles USING GIN(roles);
CREATE INDEX idx_profiles_location    ON public.profiles(location_lat, location_lng);
CREATE INDEX idx_profiles_pehchan     ON public.profiles(pehchan_score DESC);

-- Listings
CREATE INDEX idx_listings_seller      ON public.listings(seller_id);
CREATE INDEX idx_listings_type        ON public.listings(item_type);
CREATE INDEX idx_listings_category    ON public.listings(category);
CREATE INDEX idx_listings_location    ON public.listings(location_lat, location_lng);
CREATE INDEX idx_listings_promoted    ON public.listings(is_promoted_ad) WHERE is_promoted_ad = true;
CREATE INDEX idx_listings_available   ON public.listings(is_available) WHERE is_available = true;
CREATE INDEX idx_listings_price       ON public.listings(price);

-- Customer Requests
CREATE INDEX idx_requests_customer    ON public.customer_requests(customer_id);
CREATE INDEX idx_requests_status      ON public.customer_requests(status);
CREATE INDEX idx_requests_location    ON public.customer_requests(location_lat, location_lng);
CREATE INDEX idx_requests_open        ON public.customer_requests(created_at DESC) WHERE status = 'open';

-- Bids
CREATE INDEX idx_bids_request         ON public.bids_and_deals(request_id);
CREATE INDEX idx_bids_provider        ON public.bids_and_deals(provider_id);
CREATE INDEX idx_bids_status          ON public.bids_and_deals(status);

-- Reservations
CREATE INDEX idx_reserv_listing       ON public.reservations(listing_id);
CREATE INDEX idx_reserv_customer      ON public.reservations(customer_id);
CREATE INDEX idx_reserv_status        ON public.reservations(status);
CREATE INDEX idx_reserv_expiry        ON public.reservations(expires_at) WHERE status = 'active';


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids_and_deals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations      ENABLE ROW LEVEL SECURITY;


-- ── PROFILES ─────────────────────────────────────────────────

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_id);


-- ── LISTINGS ─────────────────────────────────────────────────

CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "Sellers can insert own listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    seller_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Sellers can update own listings"
  ON public.listings FOR UPDATE
  USING (
    seller_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Sellers can delete own listings"
  ON public.listings FOR DELETE
  USING (
    seller_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );


-- ── CUSTOMER REQUESTS ────────────────────────────────────────

CREATE POLICY "Requests are viewable by everyone"
  ON public.customer_requests FOR SELECT
  USING (true);

CREATE POLICY "Customers can insert own requests"
  ON public.customer_requests FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Customers can update own requests"
  ON public.customer_requests FOR UPDATE
  USING (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );


-- ── BIDS AND DEALS ───────────────────────────────────────────

-- Viewable by request owner and bid provider
CREATE POLICY "Bids viewable by participants"
  ON public.bids_and_deals FOR SELECT
  USING (
    provider_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR
    request_id IN (
      SELECT id FROM public.customer_requests
      WHERE customer_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Providers can insert bids"
  ON public.bids_and_deals FOR INSERT
  WITH CHECK (
    provider_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Providers can update own bids"
  ON public.bids_and_deals FOR UPDATE
  USING (
    provider_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );


-- ── RESERVATIONS ─────────────────────────────────────────────

CREATE POLICY "Reservations viewable by customer and seller"
  ON public.reservations FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR
    listing_id IN (
      SELECT id FROM public.listings
      WHERE seller_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Customers can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
  );

CREATE POLICY "Participants can update reservations"
  ON public.reservations FOR UPDATE
  USING (
    customer_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    OR
    listing_id IN (
      SELECT id FROM public.listings
      WHERE seller_id IN (SELECT id FROM public.profiles WHERE auth_id = auth.uid())
    )
  );


-- ============================================================
-- ✅  SCHEMA COMPLETE!
--
-- Tables created:
--   1. profiles          — all users (buyers, sellers, mechanics, agents)
--   2. listings          — universal: products, services, food, bulk
--   3. customer_requests — problem uploads for community bidding
--   4. bids_and_deals    — provider offers on customer problems
--   5. reservations      — ₹10 hold before pickup
--
-- Next steps:
--   1. Paste this in Supabase SQL Editor → Run
--   2. Verify 5 tables in Table Editor
--   3. Run seed_v2.sql for demo data
-- ============================================================
