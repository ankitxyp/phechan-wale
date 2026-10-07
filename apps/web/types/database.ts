/* ══════════════════════════════════════════════════════════════════
   PEHCHAN WALE — Database Types v2
   Mirrors the Supabase PostgreSQL schema (docs/schema.sql)
   ══════════════════════════════════════════════════════════════════ */

// ── Role type ──
export type UserRole = "buyer" | "seller" | "mechanic" | "farmer" | "agent";

// ── Listing item type ──
export type ItemType = "product" | "service" | "food" | "bulk";

// ── Request status ──
export type RequestStatus = "open" | "bidding" | "assigned" | "solved" | "cancelled";

// ── Bid status ──
export type BidStatus = "pending" | "accepted" | "rejected" | "completed" | "disputed";

// ── Reservation status ──
export type ReservationStatus = "active" | "picked_up" | "expired" | "cancelled" | "refunded";


/* ── 1. Profile ── */

export interface Profile {
  id: string;
  auth_id: string | null;
  name: string;
  phone: string;
  avatar_url: string | null;
  bio: string | null;
  roles: UserRole[];
  pehchan_score: number;
  wallet_balance: number;
  is_agent_verified: boolean;
  location_lat: number | null;
  location_lng: number | null;
  location_label: string | null;
  created_at: string;
  updated_at: string;
}


/* ── 2. Listing ── */

export interface Listing {
  id: string;
  seller_id: string;
  item_type: ItemType;
  category: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_urls: string[] | null;
  stock_or_moq: string | null;
  unit: string | null;
  online_price: number | null;
  is_promoted_ad: boolean;
  is_available: boolean;
  location_lat: number | null;
  location_lng: number | null;
  location_label: string | null;
  created_at: string;
  updated_at: string;
}


/* ── 3. Customer Request ── */

export interface CustomerRequest {
  id: string;
  customer_id: string;
  problem_image_url: string | null;
  description: string;
  ai_estimated_price: number | null;
  ai_category: string | null;
  status: RequestStatus;
  location_lat: number | null;
  location_lng: number | null;
  location_label: string | null;
  created_at: string;
  updated_at: string;
}


/* ── 4. Bid / Deal ── */

export interface BidDeal {
  id: string;
  request_id: string;
  provider_id: string;
  offered_price: number;
  message: string | null;
  voice_note_url: string | null;
  estimated_time: string | null;
  status: BidStatus;
  created_at: string;
}


/* ── 5. Reservation ── */

export interface Reservation {
  id: string;
  listing_id: string;
  customer_id: string;
  reservation_fee: number;
  status: ReservationStatus;
  expires_at: string;
  created_at: string;
}


/* ══════════════════════════════════════════════════════════════════
   JOINED / ENRICHED TYPES — used by frontend hooks
   ══════════════════════════════════════════════════════════════════ */

/** Listing with seller profile (from Supabase join) */
export interface ListingWithSeller extends Listing {
  profiles: Pick<Profile, "id" | "name" | "pehchan_score" | "avatar_url" | "roles">;
}

/** Customer request with customer profile */
export interface RequestWithCustomer extends CustomerRequest {
  profiles: Pick<Profile, "id" | "name" | "location_label">;
}

/** Bid with provider profile */
export interface BidWithProvider extends BidDeal {
  profiles: Pick<Profile, "id" | "name" | "pehchan_score" | "avatar_url" | "roles">;
}

/** Reservation with listing and customer */
export interface ReservationWithDetails extends Reservation {
  listings: Pick<Listing, "id" | "title" | "price" | "location_label" | "seller_id">;
  profiles: Pick<Profile, "id" | "name" | "phone">;
}
