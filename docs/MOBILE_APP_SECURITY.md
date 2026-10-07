# Pehchan Wale — Mobile App Security & Data Privacy

**Version:** 1.0  
**Date:** 2026-10-05  
**Status:** Phase 0 — Awaiting Approval  

---

## 1. Overview
This document outlines the security architecture, authorization rules, data privacy standards, and threat mitigation strategies for the Pehchan Wale mobile ecosystem. As an application facilitating hyper-local commerce, handling PII (Personally Identifiable Information), financial states, and real-world interactions, security is a primary architectural driver.

## 2. Authentication & Session Management

### 2.1 Supabase Auth
*   **Mechanism:** Phone number and OTP via Supabase Auth (`signInWithOtp`).
*   **Tokens:** JWT (JSON Web Tokens) are used for session management.
*   **Storage:** Tokens must be stored securely on the mobile device using `expo-secure-store` (which utilizes iOS Keychain and Android Keystore). Never store tokens in plain `AsyncStorage`.
*   **Expiration:** Access tokens have short lifespans. Refresh tokens are used to maintain sessions transparently.
*   **Revocation:** Logging out must actively invalidate the session on the Supabase server and wipe the local secure store.

### 2.2 Role-Based Access Control (RBAC)
*   Roles (`buyer`, `seller`, `mechanic`, `farmer`, `agent`) are stored as an array in the `profiles` table.
*   **Source of Truth:** Role claims must be verified via Supabase Row Level Security (RLS) policies or secure server-side functions, *never* trusted from client state.

## 3. Database Security (Supabase RLS)

All database access from the mobile applications happens via the Supabase PostgREST API, authenticated by the user's JWT. Row Level Security (RLS) is mandatory for all tables.

### 3.1 Existing Table Policies
*   **`profiles`**:
    *   *Select*: Public SELECT is restricted to public provider/shop metadata (name, shop info, public rating). Customer/buyer profiles and sensitive columns (wallet_balance, private phone numbers, home addresses) must strictly require auth.uid() = id or be accessed via a secure view to prevent data harvesting.
    *   *Insert/Update*: Users can only insert/modify their own row (`auth.uid() = auth_id`).
*   **`listings`**:
    *   *Select*: Publicly viewable.
    *   *Insert/Update/Delete*: Only the owner (verified via `seller_id` matching `auth.uid()`) can modify.
*   **`customer_requests`**:
    *   *Select*: Publicly viewable (so providers can see open requests).
    *   *Insert/Update*: Only the customer who created the request can modify it.
*   **`bids_and_deals`**:
    *   *Select*: Viewable only by the request owner and the bid provider.
    *   *Insert/Update*: Providers can only create/update their own bids.
*   **`reservations`**:
    *   *Select/Update*: Viewable and modifiable only by the customer who made it and the seller of the listing.

### 3.2 New Table Policies (To Be Implemented)
*   **`shops`**: Similar to listings; owners only.
*   **`messages`**: Users can only `SELECT` and `INSERT` messages where their `user_id` is part of the conversation thread.
*   **`transactions` / `wallet`**: `INSERT` and `UPDATE` on financial records must be heavily restricted to server-side Edge Functions/RPCs. Clients can only `SELECT` their own history.

### 3.3 Protection Against Race Conditions
*   **Current Vulnerability:** The `creditAgentWallet` API in the web app performs a client-side read, calculates the new balance, and writes it back. This is vulnerable to race conditions and manipulation.
*   **Mitigation:** Financial updates must use Supabase RPC functions for atomic operations (e.g., `UPDATE profiles SET wallet_balance = wallet_balance + amount WHERE id = user_id`).

## 4. Financial & Business Logic Security

### 4.1 Server-Side Validation (Zero Client Trust)
*   **Pricing:** The mobile client *never* dictates the final price of an item or service for checkout/reservation. The server must re-fetch the current price from the `listings` table when generating a transaction.
*   **Payment State:** `paymentSuccess=true` sent from a mobile app is strictly ignored for fulfillment. Payment status is only updated via secure webhooks from the payment gateway provider (e.g., Razorpay/PayU) directly to Supabase.
*   **State Machine Transitions:** Status changes (e.g., `reservation` moving from `active` to `picked_up`, or `kyc` moving to `approved`) must be validated against allowed transitions in Postgres constraints or triggers to prevent skipping steps.
*   **Payment Webhook Integrity:** All inbound payment webhooks must validate cryptographic HMAC signatures (using the gateway's webhook secret) before recording transactions or changing order/reservation states.

### 4.2 Agent KYC Constraints
*   **Self-Approval Prevention:** The system must strictly enforce that an agent (`auth.uid()`) cannot approve a KYC request they submitted themselves.
*   **Commission Integrity:** Commission payouts are calculated server-side based on verified `approved` states, never submitted directly by the agent app.

## 5. Data Privacy & Handling

### 5.1 Personally Identifiable Information (PII)
*   **Phone Numbers:** Essential for O2O commerce, but exposure should be limited. If a provider's phone number is public, it must be explicitly consented to during onboarding.
*   **Aadhaar/KYC Data:** Sensitive KYC documents (photos, ID numbers) must be stored in secure Supabase Storage buckets.
    *   *Bucket Policy:* Private. Only accessible by the uploading Agent (for review) and Super Admins. Never public.

### 5.2 Location Data
*   **Tracking:** The app only requests location when actively needed (e.g., "Find shops near me"). Background location tracking is strictly prohibited for customers and vendors. (May be considered for agents on active duty, but only with explicit ongoing consent).
*   **Storage:** Precise lat/long coordinates stored in the database are necessary for the platform's core function. Ensure database access is restricted via RLS.

## 6. Infrastructure & Environment Security

### 6.1 API Keys & Secrets
*   **Supabase Anon Key:** The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to embed in the mobile app. It only grants access according to RLS policies.
*   **Supabase Service Role Key:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and provides full admin access. **This key must NEVER be embedded in the mobile application codebase.**
*   **Payment Gateway Keys:** Secret keys for payment processing must reside securely in backend Edge Functions or webhooks.

### 6.2 File Upload Security (Images)
*   **Validation:** Use Supabase Storage upload policies to restrict uploads by file type (e.g., `image/jpeg`, `image/png`, `image/webp`) and size (e.g., max 5MB).
*   **Malware Protection:** Ensure clients cannot upload arbitrary executables disguised as images.

### 6.3 App Integrity & Network
*   **Transport Layer:** All communication with Supabase and APIs occurs over HTTPS (TLS 1.3).
*   **Abuse Prevention / Rate Limiting:** Supabase's built-in rate limiting will protect against brute-force OTP attempts. For custom Edge Functions, implement rate limiting to prevent spam (e.g., spamming message threads).

## 7. Operational Security

*   **Audit Logging:** Critical actions (KYC approval, Wallet adjustments, Account deletion) should generate server-side audit logs.
*   **Reporting Mechanisms:** Provide in-app tools for users to report fraudulent shops, abusive messages, or fake service providers.
*   **Commit Practices:** Ensure `.env` files and keystore files are strictly included in `.gitignore` to prevent secret leakage in version control.
