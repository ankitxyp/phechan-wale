# Pehchan Wale — Mobile App Architecture

**Version:** 1.0  
**Date:** 2026-10-05  
**Status:** Phase 0 — Awaiting Approval  

---

## 1. Existing Project Audit Summary

### 1.1 What Was Inspected

Every file in the existing `phechan wale/` workspace was inspected:

| Area | Files Inspected |
|---|---|
| **Config** | `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.env.local`, `.gitignore` |
| **Layout & Styles** | `app/layout.tsx`, `app/globals.css` (design system v4) |
| **Pages** | `app/page.tsx` (home), `app/login/page.tsx`, `app/checkout/page.tsx`, `app/fix-problem/page.tsx`, `app/shop/[id]/page.tsx`, `app/track-order/page.tsx`, `app/vendor-dashboard/page.tsx`, `app/agent-dashboard/page.tsx`, `app/admin-god-mode/page.tsx` |
| **Components** | `app/components/ShopCertificate.tsx` |
| **Lib** | `lib/supabase.ts`, `lib/supabaseClient.ts`, `lib/api/shopActions.ts` |
| **Types** | `types/database.ts` |
| **Database** | `docs/schema.sql`, `docs/seed.sql` |
| **Documentation** | `docs/PRD.md` |
| **Hooks** | `hooks/` (empty directory) |
| **Public** | Default Next.js SVGs only |

### 1.2 What Currently Exists

**Technology Stack:**
- **Framework:** Next.js 16.2.10 (App Router, React 19.2.4)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with custom CSS design system (CSS variables)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **UI Icons:** Lucide React
- **Additional Packages:** `html2canvas`, `jspdf`, `qrcode.react`
- **Deployment:** Vercel (inferred from presence of `vercel.svg`, `next.config.ts`)

**Database Schema (5 tables):**
1. `profiles` — Universal user table (buyer, seller, mechanic, farmer, agent roles)
2. `listings` — Universal listing table (product, service, food, bulk)
3. `customer_requests` — Problem/issue reports from customers
4. `bids_and_deals` — Provider bids on customer problems
5. `reservations` — ₹10 product hold/reserve system

**Authentication:**
- Phone + OTP via Supabase Auth (`signInWithOtp`)
- Demo/fallback mode (accepts OTP "1234" when Supabase SMS isn't configured)
- Role selection post-login (customer / vendor / agent)

**Pages & Features:**
| Page | Purpose | Data Source |
|---|---|---|
| Home (`/`) | Product discovery, service discovery, farmer produce, bidding banner, SOS | **Mock data** (hardcoded arrays) |
| Login (`/login`) | Phone OTP auth, role selection | **Supabase Auth** (real) |
| Checkout (`/checkout`) | Reservation payment flow | **Mock data** |
| Fix Problem (`/fix-problem`) | Submit repair issue, view bids | **Mock data + Supabase** (partial) |
| Shop Detail (`/shop/[id]`) | Individual shop profile | **Mock data** |
| Track Order (`/track-order`) | Live order tracking + chat | **Mock data** |
| Vendor Dashboard (`/vendor-dashboard`) | Catalog, leads, orders management | **Mock data + Supabase** (partial) |
| Agent Dashboard (`/agent-dashboard`) | Shop registration, earnings, KYC | **Supabase** (real inserts) |
| Admin (`/admin-god-mode`) | KYC approvals, payouts, dashboard | **Mock data** |

**Key Observations:**
- The home page, shop pages, and most dashboards use **hardcoded mock data**, not live Supabase queries
- Authentication is **real** (Supabase OTP with fallback)
- Agent shop registration writes to Supabase **for real** (`registerNewShop`, `triggerAutoCatalog`, `creditAgentWallet`)
- The `creditAgentWallet` function has a **race condition** (read-then-write without transaction)
- Two duplicate Supabase client files exist: `lib/supabase.ts` and `lib/supabaseClient.ts`
- No messaging/chat system exists in the database
- No notifications infrastructure
- No payment gateway integration
- No file upload infrastructure (Supabase Storage not configured)
- Design system is well-structured with CSS variables and dark mode support
- RLS policies are properly defined for all 5 tables

---

## 2. Reusability Analysis

### 2.1 What Can Be Reused Directly

| Asset | Reusable? | Notes |
|---|---|---|
| Supabase project & config | ✅ Yes | Same Supabase URL + anon key for mobile |
| Database schema (5 tables) | ✅ Yes | Core schema is sound |
| RLS policies | ✅ Yes | Properly scoped per table |
| Database types (`types/database.ts`) | ✅ Yes | Extract to shared package |
| Design system colors/tokens | ✅ Yes | Port CSS variables to React Native theme |
| Auth flow (OTP) | ✅ Yes | Supabase Auth works cross-platform |
| Pehchan Score concept | ✅ Yes | Already in profiles table |
| Brand identity (logo, tagline) | ✅ Yes | "प" mark, "Apne Logon Se" |

### 2.2 What Needs Modification

| Asset | Change Required |
|---|---|
| `shopActions.ts` | `creditAgentWallet` needs server-side implementation (RPC/Edge Function) to prevent race conditions |
| `supabaseClient.ts` / `supabase.ts` | Deduplicate; create one shared Supabase client factory for both web and mobile |
| Database schema | Add tables for: `shops`, `messages`, `notifications`, `service_bookings`, `transactions`, `reviews`, `user_devices` |
| RLS policies | Add policies for new tables; tighten existing where needed |

### 2.3 What Must Be Newly Created

| Component | Reason |
|---|---|
| React Native Customer App | Does not exist |
| React Native Partner App | Does not exist |
| Shared packages (types, API, validation) | Logic is currently embedded in page components |
| Messaging system (DB tables + real-time) | No messaging infrastructure exists |
| Notification system (push + DB) | No notification infrastructure exists |
| Service booking state machine | Current fix-problem flow uses mock bids |
| File upload service | No Supabase Storage bucket configured |
| Payment integration | No gateway configured |
| Proper `shops` table | Shops are currently just `profiles` with role="seller" |
| Reviews/ratings table | Not in current schema |
| Transaction ledger | Not in current schema |

---

## 3. Recommended Mobile Technology

### 3.1 Decision: **React Native (Expo)**

**Rationale:**

| Factor | React Native + Expo | Flutter | Native (Kotlin) |
|---|---|---|---|
| Code sharing with existing web (React/TS) | ✅ Maximum (shared types, logic, Supabase client) | ❌ Dart required — complete rewrite | ❌ Kotlin — complete rewrite |
| Team knowledge (current stack is React/TS) | ✅ Minimal learning curve | ❌ New language | ❌ New language |
| Cross-platform (Android first, iOS later) | ✅ Single codebase | ✅ Single codebase | ❌ Android only |
| Supabase SDK | ✅ `@supabase/supabase-js` (same as web) | ⚠️ Community package | ⚠️ Community package |
| Native features (camera, location, push) | ✅ Expo modules | ✅ Flutter plugins | ✅ Native |
| OTA updates | ✅ EAS Update | ❌ No | ❌ No |
| Build system | ✅ EAS Build | ✅ Gradle | ✅ Gradle |
| Performance for this use case | ✅ Sufficient (marketplace app, not a game) | ✅ Excellent | ✅ Excellent |

**Specific Expo SDK:** Expo SDK 52+ (latest stable)

**Key Libraries:**
- `expo-router` — File-based navigation (mirrors Next.js conventions)
- `@supabase/supabase-js` — Same client as web
- `expo-secure-store` — Token/session storage
- `expo-location` — GPS
- `expo-camera` — Photo capture
- `expo-image-picker` — Gallery selection
- `expo-notifications` — Push notifications
- `expo-linking` — Deep links, tel:, directions
- `react-native-maps` — Map views
- `@shopify/flash-list` — Performant lists
- `zustand` — State management (lightweight)
- `zod` — Validation (shared with web)

---

## 4. Recommended Project Structure

```
phechan-wale/                          ← existing repo root
├── apps/
│   ├── web/                           ← EXISTING Next.js app (moved from app/)
│   │   ├── app/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── package.json
│   │   └── ...
│   ├── customer/                      ← NEW: React Native Customer App
│   │   ├── app/                       ← expo-router pages
│   │   │   ├── (tabs)/               ← Tab-based navigation
│   │   │   │   ├── index.tsx          ← Home
│   │   │   │   ├── search.tsx         ← Search
│   │   │   │   ├── bookings.tsx       ← My Bookings
│   │   │   │   └── profile.tsx        ← Profile
│   │   │   ├── auth/
│   │   │   ├── shop/[id].tsx
│   │   │   ├── product/[id].tsx
│   │   │   ├── service/[id].tsx
│   │   │   ├── booking/[id].tsx
│   │   │   ├── messages/
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── theme/
│   │   ├── app.json
│   │   └── package.json
│   └── partner/                       ← NEW: React Native Partner App
│       ├── app/
│       │   ├── (vendor-tabs)/
│       │   ├── (agent-tabs)/
│       │   ├── auth/
│       │   └── _layout.tsx
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       ├── theme/
│       ├── app.json
│       └── package.json
├── packages/
│   ├── shared-types/                  ← Shared TypeScript types
│   │   ├── database.ts
│   │   ├── api.ts
│   │   ├── enums.ts
│   │   └── package.json
│   ├── shared-validation/             ← Zod schemas
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── listing.ts
│   │   └── package.json
│   ├── shared-api/                    ← Supabase data access layer
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── shops.ts
│   │   ├── listings.ts
│   │   ├── bookings.ts
│   │   ├── messages.ts
│   │   └── package.json
│   └── shared-constants/              ← Categories, statuses, config
│       ├── categories.ts
│       ├── statuses.ts
│       └── package.json
├── supabase/
│   ├── migrations/                    ← Tracked DB migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_shops_table.sql
│   │   ├── 003_messages.sql
│   │   ├── 004_service_bookings.sql
│   │   ├── 005_notifications.sql
│   │   └── ...
│   └── seed.sql
├── docs/
│   ├── PRD.md                         ← EXISTING
│   ├── schema.sql                     ← EXISTING
│   ├── seed.sql                       ← EXISTING
│   ├── MOBILE_APP_ARCHITECTURE.md     ← THIS FILE
│   ├── MOBILE_APP_ROADMAP.md
│   ├── MOBILE_APP_FEATURE_SPEC.md
│   └── MOBILE_APP_SECURITY.md
├── package.json                       ← Workspace root (npm workspaces)
└── .gitignore
```

**Migration Strategy for Existing Web App:**

**PREREQUISITE:** Do not execute any file moves or folder reorganizations until the inner Git repository (phechan-wale) has successfully pushed the backup branch 'backup/pre-monorepo-migration' to origin, and Vercel build configuration has been verified.

1. Move `app/` → `apps/web/`
2. Update import paths
3. Update Vercel build settings to point to `apps/web/`
4. Verify web app still deploys correctly
5. Only then begin mobile app work

---

## 5. Database Schema Extensions

New tables required (added via migrations, not modifying existing tables):

### 5.1 `shops` (dedicated shop entity)
Currently shops are just `profiles` with role="seller". A proper `shops` table enables:
- Multiple shops per vendor
- Shop-specific metadata (hours, logo, photos, verification)
- Better querying and indexing

### 5.2 `messages`
Real-time messaging between customers ↔ vendors/providers.

### 5.3 `service_bookings`
State machine for service requests (distinct from product reservations).

### 5.4 `reviews`
Ratings and text reviews tied to completed transactions.

### 5.5 `notifications`
Persistent notification records with read/unread status.

### 5.6 `transactions`
Financial ledger for payments, commissions, refunds.

### 5.7 `user_devices`
Push notification tokens per user/device.

---

## 6. Architecture Principles

1. **Shared Supabase Backend** — Both web and mobile apps connect to the same Supabase project
2. **Shared Types** — Single source of truth for TypeScript interfaces
3. **Server-Side Validation** — All business-critical operations validated via RLS + Postgres functions
4. **State Machines** — Booking and KYC statuses use explicit enum states, not booleans
5. **Mobile-First UI** — Native navigation patterns, not web-wrapped views
6. **Offline Awareness** — Graceful handling of poor network conditions
7. **Security by Default** — No secrets in client code, no trusted client-side prices

---

## 7. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Moving web app to `apps/web/` may break Vercel deployment | **High** | Test deployment after move; update Vercel root directory setting |
| Mock data in web pages means mobile needs real API from scratch | **Medium** | Build shared API layer first; benefit both web and mobile |
| `creditAgentWallet` race condition in production | **High** | Replace with Supabase RPC (atomic `UPDATE ... SET wallet_balance = wallet_balance + $1`) |
| No Supabase Storage configured — file uploads won't work | **Medium** | Create storage buckets before implementing photo features |
| Supabase SMS/OTP may not be enabled in production | **Medium** | Verify Supabase project settings; configure SMS provider (Twilio) |
| Two duplicate Supabase client files | **Low** | Consolidate during shared-api package creation |
| Large monolithic page components (1000+ line files) | **Medium** | Mobile app will use proper component decomposition from the start |
| No existing test infrastructure | **Medium** | Add testing in Phase 18 (Testing & Release) with critical path tests implemented during earlier feature milestones. |
