-- ============================================================
-- PEHCHAN WALE — Mobile Schema Extensions & Atomic RPCs
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. TABLES
-- ────────────────────────────────────────────────────────────

-- Transactions Table (for wallet ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shops Table (Dedicated shop profile)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    opening_hours JSONB,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service Bookings (Tracking workflow stages)
CREATE TABLE IF NOT EXISTS public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'assigned', 'in_progress', 'solved', 'cancelled')),
    problem_description TEXT NOT NULL,
    photo_url TEXT,
    agreed_price NUMERIC(12, 2),
    verification_pin TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages (Chat module)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications (In-app alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Devices (Push notification targets)
CREATE TABLE IF NOT EXISTS public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL UNIQUE,
    device_platform TEXT NOT NULL CHECK (device_platform IN ('android', 'ios')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
-- 2. ATOMIC WALLET RPC
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.credit_wallet_atomic(p_user_id UUID, p_amount NUMERIC, p_source TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Increment wallet balance inside a single atomic transaction
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id;

  -- Insert ledger entry
  INSERT INTO public.transactions (user_id, amount, type, status, reference_id)
  VALUES (
      p_user_id, 
      ABS(p_amount), 
      CASE WHEN p_amount >= 0 THEN 'credit' ELSE 'debit' END, 
      'success', 
      p_source
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. ROW-LEVEL SECURITY & POLICIES
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Shops
DROP POLICY IF EXISTS "Shops are publicly viewable" ON public.shops;
DROP POLICY IF EXISTS "Users can insert own shop" ON public.shops;
DROP POLICY IF EXISTS "Users can update own shop" ON public.shops;
CREATE POLICY "Shops are publicly viewable" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Users can insert own shop" ON public.shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own shop" ON public.shops FOR UPDATE USING (auth.uid() = owner_id);

-- Service Bookings
DROP POLICY IF EXISTS "Participants view bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Customers insert bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Participants update bookings" ON public.service_bookings;
CREATE POLICY "Participants view bookings" ON public.service_bookings FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_id);
CREATE POLICY "Customers insert bookings" ON public.service_bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Participants update bookings" ON public.service_bookings FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_id);

-- Messages
DROP POLICY IF EXISTS "Participants view messages" ON public.messages;
DROP POLICY IF EXISTS "Users insert own messages" ON public.messages;
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;
DROP POLICY IF EXISTS "Users insert own reviews" ON public.reviews;
CREATE POLICY "Reviews are publicly viewable" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- User Devices
DROP POLICY IF EXISTS "Users view own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users insert own devices" ON public.user_devices;
DROP POLICY IF EXISTS "Users update own devices" ON public.user_devices;
CREATE POLICY "Users view own devices" ON public.user_devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own devices" ON public.user_devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own devices" ON public.user_devices FOR UPDATE USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 4. PERFORMANCE INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_owner_id ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_geo ON public.shops(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer_id ON public.service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target_id ON public.reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
