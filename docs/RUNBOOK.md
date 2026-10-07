# Pehchan Wale Developer Runbook

Welcome to the Pehchan Wale Developer Runbook. This document serves as the single source of truth for the architecture, local development workflow, physical device testing, database operations, and our core business engines.

## 🏗️ Architecture Overview

The **Pehchan Wale** ecosystem is structured as an NPM Monorepo containing 3 primary applications and 4 shared local packages.

### Applications

1. **`apps/web`**: Next.js 16 Web Application.
   - **Admin God Mode**: Comprehensive operations dashboard.
   - **Shop Webfronts**: Public web store listings.
   - **Checkout**: Secure online reservation and booking flows.
2. **`apps/customer`**: React Native (Expo) Mobile App.
   - **Discover (Pehchan)**: Local kirana store discovery and product catalog navigation.
   - **Fix/Bids (समस्या)**: Reverse-bidding system for immediate mechanic/plumber service requests.
   - **Store Pickups (बुकिंग)**: Live tracking of reserved items.
   - **Profile Trust Meter**: Pehchan community trust score based on successful order history.
3. **`apps/partner`**: React Native (Expo) Mobile App.
   - **PIN Counter**: High-speed, Soundbox-integrated counter for completing orders with the 4-Digit Handshake.
   - **Reverse Bids (Jobs)**: Partner feed to bid on incoming customer service requests.
   - **Quick Stock Switches**: Lightning-fast UI to toggle stock availability and boost items with Spotlight.
   - **Atomic Hisaab (Wallet)**: Deep Ledger and Agent Commission management with WhatsApp integration.

### Shared Packages (`packages/`)

- **`shared-types`**: TypeScript interfaces mirroring the Supabase schema (`listings`, `profiles`, `service_bookings`, etc.).
- **`shared-constants`**: Universal configuration variables and constants.
- **`shared-validation`**: Zod schemas for input validation across Web and Mobile.
- **`shared-api`**: Supabase client utilities, realtime hooks (`useRealtimeChat`), and shop actions.

---

## 🛠️ Local Development Workflow

Pehchan Wale uses standard NPM workspaces for seamless inter-package resolution.

### 1. Installation
Run this at the root of the monorepo to bootstrap all applications and packages:
```bash
npm install
```

### 2. Available Root Scripts
You can easily spin up the specific parts of the stack you are working on directly from the root `package.json`:

- **Start Web Admin** (Localhost:3000):
  ```bash
  npm run dev:web
  ```
- **Start Customer Mobile App** (Expo Bundler with QR Code):
  ```bash
  npm run start:customer
  ```
- **Start Partner Mobile App** (Expo Bundler with QR Code):
  ```bash
  npm run start:partner
  ```

### 3. Verification & Typechecking
Before opening pull requests, verify monorepo integrity:
```bash
npm run typecheck
npm run verify:all
```
*Note: `verify:all` automatically checks cross-package resolution and builds the web bundle to ensure strict boundaries remain intact.*

---

## 📱 Testing On Physical Devices (Expo Go)

Due to our usage of native modules like `expo-haptics`, `expo-speech`, and `expo-notifications`, we rely heavily on Expo's capabilities.

1. **Install Expo Go** on your Android or iOS device from the respective App Stores.
2. Ensure your mobile device and your development computer are on the **same Wi-Fi network**.
3. Run `npm run start:customer` or `npm run start:partner`.
4. **Scan the QR Code**:
   - **Android**: Open the Expo Go app and tap "Scan QR Code".
   - **iOS**: Open the native Camera app, scan the QR, and tap the Expo Go prompt.

### Environment Setup
You must configure your local Supabase keys before connecting. Create `.env` files inside both `apps/customer/` and `apps/partner/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 💾 Database & RPC Operations

Our backend leverages **Supabase** (PostgreSQL + PostgREST). 

### Migration History
All schema definitions, RLS (Row Level Security) policies, and RPC (Remote Procedure Calls) are stored in:
`supabase/migrations/001_mobile_schema_and_rpcs.sql`

### The Atomic Wallet (RPC)
Wallet balances and payouts are heavily guarded to prevent race conditions. The `credit_wallet_atomic` RPC function allows for thread-safe incrementing of agent commissions and partner payouts.
- **Triggered when:** A service booking is marked 'completed' via PIN verification, immediately settling partner payouts.

### The 4-Digit PIN Handshake Protocol
To eliminate fraud on cash-on-pickup and direct-service jobs, we use a 4-digit verification protocol:
1. **Creation**: When a customer reserves an item or accepts a service bid, a 4-digit PIN is generated and attached to the `reservations` or `service_bookings` table.
2. **Delivery**: The customer receives this PIN in their app (e.g., "6482").
3. **Verification**: At the shop counter or upon mechanic arrival, the partner enters the PIN into the `Counter` tab.
4. **Execution**: The database validates the PIN. If correct, the transaction status shifts from `active` to `picked_up` or `assigned` to `completed`.

---

## 💰 Revenue & Monetization Engine

### Dukaan Spotlight ("आज का ऑफर")
Partners can mark specific catalog items as "Featured". This immediately bumps the item to the top of the Customer Discovery feed in the `Explore` tab, highlighting it in Saffron.

### Soundbox Voice Confirmation Flow
Using `expo-speech` (and native TTS), the Partner App acts as an auditory confirmation tool similar to physical Soundbox devices. 
- When a PIN is successfully entered or an online payment clears, the device speaks: *"Order verified. Payment received."* in Hindi (`hi-IN`).

### WhatsApp Hisaab Summary Exports
The daily ledger summary allows shop owners and mechanics to bypass complicated accounting software. The `generateHisaabSummary()` function calculates:
- Total Earnings Today
- Pending Settlements
- Count of Transactions

This plain-text summary is passed directly to the native WhatsApp client via `Linking.openURL`, allowing instant sharing with business partners or agents.
