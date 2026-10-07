# Pehchan Wale — Mobile App Feature Specification

**Version:** 1.0  
**Date:** 2026-10-05  
**Status:** Phase 0 — Awaiting Approval  

---

## 1. Overview
This document details the functional specifications for the initial release (V1) of the Pehchan Wale mobile applications. The ecosystem consists of two separate React Native applications:
1. **Pehchan Wale Customer App**
2. **Pehchan Wale Partner App** (Vendor & Agent Modes)

## 2. Shared Core Features

### 2.1 Authentication & Authorization
*   **Method:** Phone Number + OTP.
*   **Provider:** Supabase Auth (`signInWithOtp`).
*   **Fallback:** Demo mode for non-production environments (accepts default OTP "1234").
*   **Session Management:** Secure storage of auth tokens (`expo-secure-store`).
*   **Profile Management:** Name, avatar upload, and role management.
*   **Account Deletion:** Ability for users to permanently delete their account and associated data.

### 2.2 Location Services
*   **Core Function:** Determine user location for distance calculations and filtering.
*   **Permissions:** Request runtime permissions gracefully. Handle denied/restricted states.
*   **Fallback:** Allow manual entry/selection of location if GPS is unavailable or denied.
*   **Privacy:** Only track location when actively using relevant features; no background tracking unless strictly required for a specific agent feature.

### 2.3 Notifications
*   **Delivery:** Push notifications (via Expo Notifications / FCM) and in-app notification center.
*   **Preferences:** Allow users to toggle notification categories (promotions, updates).

---

## 3. Customer App (V1) Features

### 3.1 Home Screen
*   **Location Display:** Shows current selected/detected location.
*   **Global Search Bar:** Entry point for searching products, shops, and services.
*   **Category Navigation:** Quick links to major categories (Groceries, Electronics, Repairs, Farmers).
*   **Dynamic Banners:** Promotional banners for offers or new features.
*   **Curated Feeds:**
    *   *Daily Needs Near You* (Products)
    *   *Top Rated Pehchan Wale* (Service Providers)
    *   *Direct from Farmers* (Bulk/Farm produce)

### 3.2 Search & Discovery
*   **Search Scope:** Products, Shops, and Service Providers.
*   **Filtering:** Category, Price Range, Distance (radius), Rating, Availability.
*   **Sorting:** Distance (nearest first), Price (low to high), Rating (highest first).
*   **Language Support:** Basic synonym matching (e.g., mapping "rice" to "chawal").
*   **Price Comparison:** When viewing a product, show prices from multiple nearby shops alongside online reference prices.

### 3.3 Shop Profiles
*   **Details:** Shop name, logo, address, distance, opening hours, verified status badge.
*   **Content:** List of available products, categorized.
*   **Actions:** Call shop, Message shop, View directions (opens native map), Share shop link.
*   **Trust:** Display aggregate rating and review count.

### 3.4 Product Reservation Flow
*   **Concept:** Customer pays a small fee (e.g., ₹10) to reserve an item, then visits the shop to pay the balance and collect.
*   **State Machine:**
    1.  `active`: Reserved, customer has a set time window (e.g., 2 hours) to pick it up.
    2.  `picked_up`: Customer collected and paid balance.
    3.  `expired`: Time window lapsed.
    4.  `cancelled`: Customer cancelled before expiry.
    5.  `refunded`: Fee returned to wallet (if applicable based on policy).
*   **Security:** Server-side validation of pricing and status. Client cannot force a state change maliciously.

### 3.5 Service Marketplace (Booking Flow)
*   **Discovery:** View profiles of mechanics, plumbers, electricians, etc.
*   **Request Creation:** Customer selects category, describes problem, uploads photo (optional), sets preferred time.
*   **Bidding Mechanism:** Request is broadcast to nearby providers. Providers submit bids (price, ETA, message).
*   **State Machine (`customer_requests`):**
    1.  `open`: Waiting for bids.
    2.  `bidding`: Bids are coming in.
    3.  `assigned`: Customer accepted a bid.
    4.  `solved`: Job completed.
    5.  `cancelled`: Customer cancelled request.
*   **Actions:** Contact provider, Accept bid, Mark completed, Rate provider.

### 3.6 Customer Dashboard
*   **My Orders/Reservations:** History and active status of product holds.
*   **My Service Requests:** History and active status of service jobs.
*   **Wallet:** View current wallet balance (refunds, promotional credits).
*   **Settings:** Manage addresses, notification preferences, privacy settings.

---

## 4. Partner App (V1) Features

*The Partner App has two distinct modes depending on the user's role.*

### 4.1 Vendor Mode (Shop Owners & Service Providers)
*   **Dashboard:** High-level metrics (today's orders, new messages, active service requests).
*   **Shop Management:** Update shop profile, opening hours, and contact details.
*   **Catalog Management:**
    *   Add new products/services.
    *   Update pricing, availability, and stock status.
    *   Upload images.
*   **Order Management:**
    *   View active reservations.
    *   Mark reservations as `picked_up`.
*   **Lead Management (Service Providers):**
    *   View open customer requests nearby.
    *   Submit bids (price, ETA, message).
*   **Financials:** View transaction history, earnings, and withdrawal status.

### 4.2 Agent Mode (Field Agents)
*   **Dashboard:** View total earnings, pending payouts, and performance metrics.
*   **Shop Onboarding Workflow:**
    *   Form to capture new shop details (Name, Owner, Category, Phone).
    *   Location capture (GPS).
    *   Photo capture (Storefront, Owner).
*   **KYC Management:**
    *   Upload required documents for shop verification.
    *   **State Machine:** `DRAFT` -> `PENDING` -> `APPROVED` -> `REJECTED` -> `RESUBMISSION_REQUIRED`.
    *   *Constraint:* Agents cannot approve their own submitted KYC applications.
*   **Earnings Tracking:** View commission earned per successful onboarding.

---

## 5. Cross-Cutting Functional Specs

### 5.1 Communication (Calling & Messaging)
*   **Calling:** Trigger native OS phone dialer (`tel:` intent). Mask numbers if backend telephony proxy is implemented; otherwise, display verified numbers clearly.
*   **Messaging:** In-app chat interface.
    *   Features: Text, image attachments, read receipts.
    *   Safety: Block user, Report conversation, Rate limiting.

### 5.2 Ratings and Trust (Pehchan Score)
*   **Mechanics:** Users rate transactions out of 5 stars.
*   **Pehchan Score:** A proprietary trust score (0-100) combining ratings, completion rate, verification status, and complaint rate.
*   **Integrity:** Only customers with completed, verified transactions can leave a review.

### 5.3 Offline & Error Handling
*   **Offline Mode:** Display clear "No Internet Connection" banners. Disable form submissions. Allow viewing of cached data where safe.
*   **Error States:** User-friendly error messages (no raw SQL or stack traces). Retry buttons for failed network requests.
*   **Loading States:** Extensive use of Skeleton screens instead of blocking spinners to improve perceived performance.

## 6. Out of Scope for V1
*   Dedicated delivery fleet management / logistics routing.
*   Complex multi-tier loyalty point systems.
*   Advanced analytics and graphing for vendors.
*   iOS native builds (Android is the initial target).
*   Admin mobile app (Admin portal remains web-only).
