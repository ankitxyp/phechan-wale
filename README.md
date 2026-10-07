# Pehchan Wale (पहचान वाले)

An integrated Next.js & React Native ecosystem empowering India's local unorganized sector — Kirana stores, plumbers, and mechanics — with enterprise-grade discovery, real-time reverse bidding, and atomic ledger management.

## 🌟 Ecosystem Architecture

The repository is a strictly typed NPM Monorepo containing:

### 📱 Applications
- **`apps/customer`**: React Native (Expo) app for discovering shops, requesting services, tracking pickups, and real-time chat.
- **`apps/partner`**: React Native (Expo) app for shop owners and mechanics. Features a Soundbox-enabled PIN counter, lightning-fast stock switches, WhatsApp Hisaab integration, and real-time reverse bidding.
- **`apps/web`**: Next.js 16 Web Dashboard for administrative God-Mode operations and public webfronts.

### 📦 Shared Packages
Located in the `packages/` directory, used seamlessly across Web and Mobile:
- **`@pehchan-wale/shared-api`**: Supabase realtime hooks and database actions.
- **`@pehchan-wale/shared-types`**: Database and TS interfaces.
- **`@pehchan-wale/shared-constants`**: Universal configuration variables.
- **`@pehchan-wale/shared-validation`**: Zod schemas for forms and APIs.

## 🚀 Quick Start

Ensure you have Node.js 18+ installed.

### 1. Bootstrap Monorepo
```bash
npm install
```

### 2. Configure Environment
Create `.env` inside `apps/customer/` and `apps/partner/` with your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Applications
Easily boot up any layer of the stack directly from the root using our unified NPM scripts:

- **Run Web Dashboard**:
  ```bash
  npm run dev:web
  ```
- **Run Customer App (Expo)**:
  ```bash
  npm run start:customer
  ```
- **Run Partner App (Expo)**:
  ```bash
  npm run start:partner
  ```

## 📖 Developer Runbook
For an in-depth understanding of the 4-digit PIN handshake protocol, atomic wallet RPCs, and physical device testing with push notifications, please read the [Developer Runbook](./docs/RUNBOOK.md).

## 🛡️ Monorepo Integrity
Run the automated verification script to ensure cross-package resolution and strict web/mobile separation:
```bash
npm run typecheck
npm run verify:all
```
