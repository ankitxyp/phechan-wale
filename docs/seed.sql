-- ============================================================
-- PEHCHAN WALE — Seed Data v2
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================


-- ── 1. PROFILES ────────────────────────────────────────────

INSERT INTO public.profiles (id, roles, name, phone, pehchan_score, wallet_balance, is_agent_verified, location_lat, location_lng, location_label, bio) VALUES

  -- Buyers
  ('p1000000-0000-0000-0000-000000000001',
   '{"buyer"}', 'Amit Singh', '+919800000001', 50, 0.00, false,
   25.6115, 85.1376, 'Boring Road, Patna',
   'Looking for good local deals'),

  -- Sellers / Shop Owners
  ('p1000000-0000-0000-0000-000000000002',
   '{"seller"}', 'Rakesh Sharma', '+919800000002', 82, 1250.00, false,
   25.6120, 85.1380, 'Boring Road, Patna',
   'Sharma General Store — 15 years in business'),

  ('p1000000-0000-0000-0000-000000000003',
   '{"seller"}', 'Sunita Devi', '+919800000003', 75, 800.00, false,
   25.5942, 85.1600, 'Kankarbagh, Patna',
   'Krishna Kirana — your neighbourhood grocery'),

  ('p1000000-0000-0000-0000-000000000004',
   '{"seller"}', 'Manoj Gupta', '+919800000004', 70, 0.00, false,
   25.6128, 85.1448, 'Fraser Road, Patna',
   'Tech Hub Electronics — all brands, best prices'),

  ('p1000000-0000-0000-0000-000000000005',
   '{"seller"}', 'Pankaj Sahu', '+919800000005', 65, 0.00, false,
   25.6090, 85.1350, 'Boring Road, Patna',
   'Sahu Hardware — pipes, buckets, tools'),

  -- Mechanics / Service Providers
  ('p1000000-0000-0000-0000-000000000006',
   '{"mechanic", "seller"}', 'Ramesh Mistri', '+919800000006', 92, 3200.00, false,
   25.6050, 85.1180, 'Rajendra Nagar, Patna',
   'Electrician — 20 years experience. Fan, wiring, inverter.'),

  ('p1000000-0000-0000-0000-000000000007',
   '{"mechanic"}', 'Sunil Kumar', '+919800000007', 85, 1800.00, false,
   25.6170, 85.1320, 'Ashok Rajpath, Patna',
   'Plumber — all pipe work, tap fitting, leakage repair'),

  ('p1000000-0000-0000-0000-000000000008',
   '{"mechanic"}', 'Ajay Singh', '+919800000008', 95, 5500.00, false,
   25.6000, 85.1250, 'Kankarbagh, Patna',
   'Painter — Asian Paints, Nerolac. Rooms, exterior, waterproofing'),

  -- Farmers
  ('p1000000-0000-0000-0000-000000000009',
   '{"farmer", "seller"}', 'Ramji Prasad', '+919800000009', 78, 400.00, false,
   25.6300, 85.0900, 'Danapur, Patna',
   'Organic vegetables — direct from my farm'),

  ('p1000000-0000-0000-0000-000000000010',
   '{"farmer", "seller"}', 'Geeta Devi', '+919800000010', 72, 200.00, false,
   25.6350, 85.0850, 'Danapur, Patna',
   'Fresh palak, methi, dhaniya — picked every morning'),

  -- Agent
  ('p1000000-0000-0000-0000-000000000011',
   '{"agent", "buyer"}', 'Rajesh Kumar', '+919800000011', 88, 2500.00, true,
   25.6100, 85.1400, 'Boring Road, Patna',
   'Pehchan Wale field agent — registering local shops');


-- ── 2. LISTINGS ────────────────────────────────────────────

INSERT INTO public.listings (id, seller_id, item_type, category, title, description, price, online_price, stock_or_moq, unit, is_promoted_ad, location_lat, location_lng, location_label) VALUES

  -- Grocery products
  ('l1000000-0000-0000-0000-000000000001',
   'p1000000-0000-0000-0000-000000000002',
   'product', 'grocery', 'Surf Excel Matic (2kg)',
   'Top load washing powder. MRP printed on pack.',
   340.00, 395.00, '12 packs in stock', 'pack', false,
   25.6120, 85.1380, 'Sharma General Store, Boring Road'),

  ('l1000000-0000-0000-0000-000000000002',
   'p1000000-0000-0000-0000-000000000003',
   'product', 'grocery', 'Amul Butter (500g)',
   'Freshly stocked. Keep refrigerated.',
   270.00, 285.00, 'In stock', 'piece', false,
   25.5942, 85.1600, 'Krishna Kirana, Kankarbagh'),

  ('l1000000-0000-0000-0000-000000000003',
   'p1000000-0000-0000-0000-000000000002',
   'product', 'grocery', 'Ashirvaad Atta (10kg)',
   'India''s most trusted whole wheat atta.',
   410.00, 480.00, '8 bags available', 'bag', true,
   25.6120, 85.1380, 'Sharma General Store, Boring Road'),

  ('l1000000-0000-0000-0000-000000000004',
   'p1000000-0000-0000-0000-000000000003',
   'product', 'grocery', 'Fortune Sunflower Oil (5L)',
   'Pure refined sunflower oil. Heart-healthy.',
   620.00, 750.00, '5 cans in stock', 'can', false,
   25.5942, 85.1600, 'Krishna Kirana, Kankarbagh'),

  -- Electronics
  ('l1000000-0000-0000-0000-000000000005',
   'p1000000-0000-0000-0000-000000000004',
   'product', 'electronics', 'HP Laptop Charger 65W',
   'Compatible with all HP laptops. 1 year warranty.',
   420.00, 599.00, '3 left', 'piece', false,
   25.6128, 85.1448, 'Tech Hub Electronics, Fraser Road'),

  ('l1000000-0000-0000-0000-000000000005',
   'p1000000-0000-0000-0000-000000000004',
   'product', 'electronics', 'Ceiling Fan Capacitor 2.5μF',
   'Havells compatible. Fixes slow fan issue.',
   35.00, 120.00, '20+ in stock', 'piece', false,
   25.6128, 85.1448, 'Tech Hub Electronics, Fraser Road'),

  -- Hardware
  ('l1000000-0000-0000-0000-000000000006',
   'p1000000-0000-0000-0000-000000000005',
   'product', 'hardware', 'Steel Bucket (20L)',
   'Heavy duty galvanised steel bucket.',
   180.00, 320.00, 'In stock', 'piece', false,
   25.6090, 85.1350, 'Sahu Hardware, Boring Road'),

  -- Services
  ('l1000000-0000-0000-0000-000000000007',
   'p1000000-0000-0000-0000-000000000006',
   'service', 'electrician', 'Fan Repair / Installation',
   'Ceiling fan repair, regulator change, new installation. Visit charge ₹100.',
   100.00, NULL, NULL, 'per visit', false,
   25.6050, 85.1180, 'Rajendra Nagar, Patna'),

  ('l1000000-0000-0000-0000-000000000008',
   'p1000000-0000-0000-0000-000000000007',
   'service', 'plumber', 'Tap & Pipe Repair',
   'All kinds of plumbing — leaking taps, pipe fitting, bathroom fixtures.',
   150.00, NULL, NULL, 'per visit', false,
   25.6170, 85.1320, 'Ashok Rajpath, Patna'),

  ('l1000000-0000-0000-0000-000000000009',
   'p1000000-0000-0000-0000-000000000008',
   'service', 'painter', 'Room Painting (per room)',
   'Professional painting with Asian Paints. Includes primer + 2 coats.',
   2499.00, NULL, NULL, 'per room', true,
   25.6000, 85.1250, 'Kankarbagh, Patna'),

  -- Farmer / Bulk
  ('l1000000-0000-0000-0000-000000000010',
   'p1000000-0000-0000-0000-000000000009',
   'bulk', 'vegetables', 'Desi Aloo (Potatoes)',
   'Organic potatoes from my farm in Danapur. Buy 1kg or 50kg.',
   18.00, 30.00, '100 kg available', 'kg', false,
   25.6300, 85.0900, 'Ramji Farm, Danapur'),

  ('l1000000-0000-0000-0000-000000000011',
   'p1000000-0000-0000-0000-000000000009',
   'bulk', 'vegetables', 'Fresh Tomatoes',
   'Farm-fresh tomatoes. Picked today.',
   22.00, 40.00, '60 kg available', 'kg', false,
   25.6300, 85.0900, 'Ramji Farm, Danapur'),

  ('l1000000-0000-0000-0000-000000000012',
   'p1000000-0000-0000-0000-000000000010',
   'bulk', 'vegetables', 'Spinach (Palak)',
   'Organic palak — no pesticides. Picked this morning.',
   20.00, 40.00, '30 kg available', 'kg', false,
   25.6350, 85.0850, 'Geeta Farm, Danapur');


-- ── 3. CUSTOMER REQUESTS ──────────────────────────────────

INSERT INTO public.customer_requests (id, customer_id, description, ai_estimated_price, ai_category, status, location_lat, location_lng, location_label) VALUES

  ('r1000000-0000-0000-0000-000000000001',
   'p1000000-0000-0000-0000-000000000001',
   'My ceiling fan stopped working. It makes a humming sound but the blades don''t spin.',
   250.00, 'electrician', 'open',
   25.6115, 85.1376, 'Boring Road, Patna'),

  ('r1000000-0000-0000-0000-000000000002',
   'p1000000-0000-0000-0000-000000000001',
   'Kitchen sink tap is leaking badly. Need it fixed ASAP.',
   200.00, 'plumber', 'bidding',
   25.6115, 85.1376, 'Boring Road, Patna');


-- ── 4. BIDS ───────────────────────────────────────────────

INSERT INTO public.bids_and_deals (id, request_id, provider_id, offered_price, message, estimated_time, status) VALUES

  ('b1000000-0000-0000-0000-000000000001',
   'r1000000-0000-0000-0000-000000000002',
   'p1000000-0000-0000-0000-000000000007',
   180.00,
   'I can come in 30 minutes. I have the parts needed.',
   '30 minutes', 'pending'),

  ('b1000000-0000-0000-0000-000000000002',
   'r1000000-0000-0000-0000-000000000002',
   'p1000000-0000-0000-0000-000000000006',
   150.00,
   'I know basic plumbing too. Can come by evening.',
   'Today evening', 'pending');


-- ── 5. RESERVATIONS ───────────────────────────────────────

INSERT INTO public.reservations (id, listing_id, customer_id, reservation_fee, status, expires_at) VALUES

  ('v1000000-0000-0000-0000-000000000001',
   'l1000000-0000-0000-0000-000000000001',
   'p1000000-0000-0000-0000-000000000001',
   10.00, 'active', now() + interval '2 hours');


-- ============================================================
-- ✅  Seed complete! Refresh your Next.js app to see live data.
-- ============================================================
