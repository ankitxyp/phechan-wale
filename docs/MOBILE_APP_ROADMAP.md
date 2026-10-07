# Pehchan Wale — Mobile App Roadmap

**Version:** 1.0  
**Date:** 2026-10-05  
**Status:** Phase 0 — Awaiting Approval  

---

## 1. Overview
This roadmap outlines the phased execution plan for building the Pehchan Wale mobile ecosystem. The plan is structured to minimize risk, preserve the existing Vercel-deployed web application, and incrementally introduce the new mobile applications using a monorepo approach.

## 2. Phase Breakdown

### Phase 0: Existing Project Audit
*   **Status:** Complete
*   **Deliverables:** Architecture, Roadmap, Feature Spec, and Security documents.
*   **Goal:** Understand the current state of the Next.js web app, Supabase database, and mock data usage.

### Phase 1: Mobile Architecture & Monorepo Setup
*   **Goal:** Restructure the repository to support both the existing web app and the new mobile apps without breaking Vercel deployment.
*   **Tasks:**
    *   Initialize npm workspaces/monorepo structure.
    *   Move the existing `app/` code to `apps/web/`.
    *   Verify Vercel build settings and ensure the web app still works.
    *   Initialize `apps/customer/` and `apps/partner/` using React Native (Expo SDK).
    *   Set up ESLint, Prettier, and TypeScript configurations across workspaces.

### Phase 2: Shared Library Implementation
*   **Goal:** Create shared packages to avoid code duplication.
*   **Tasks:**
    *   Extract database types (`types/database.ts`) into a `shared-types` package.
    *   Create a `shared-api` package for unified Supabase data access.
    *   Create a `shared-validation` package with Zod schemas for forms and API requests.
    *   Port existing `shopActions.ts` and Supabase clients into the shared API layer.

### Phase 3: Database Migrations & Refinements
*   **Goal:** Prepare the Supabase database for the new mobile features.
*   **Tasks:**
    *   Audit and refine existing 5 tables (`profiles`, `listings`, `customer_requests`, `bids_and_deals`, `reservations`).
    *   Create SQL migrations for new tables: `shops`, `messages`, `service_bookings`, `transactions`, `reviews`, `notifications`, `user_devices`.
    *   Implement secure Supabase RPC functions (e.g., atomic wallet credits to fix the existing race condition).
    *   Update RLS policies for all new tables.

### Phase 4: Authentication (Cross-Platform)
*   **Goal:** Implement robust login flows for both apps.
*   **Tasks:**
    *   Implement Phone + OTP login using Supabase Auth in both Customer and Partner apps.
    *   Implement fallback/demo mode handling (as currently exists in the web app).
    *   Create secure session storage mechanisms (`expo-secure-store`).
    *   Implement role-based routing (Customer vs. Vendor/Agent).

### Phase 5: Customer Application Foundation
*   **Goal:** Establish the core UI architecture for the Customer app.
*   **Tasks:**
    *   Set up `expo-router` with tab-based navigation.
    *   Port the CSS design system (colors, fonts, radii) to a React Native theme (e.g., using `NativeWind` or standard `StyleSheet`).
    *   Build foundational UI components (Buttons, Inputs, Cards, Headers, Skeleton Loaders).

### Phase 6: Customer Home & Discovery
*   **Goal:** Implement the main entry point for customers.
*   **Tasks:**
    *   Implement the Customer Home screen with Category strip, Hero Carousel, and Trust Strip.
    *   Implement Location permission handling and current location display.
    *   Implement horizontal scroll rows for "Daily Needs", "Top Rated Services", and "Direct from Farmers".
    *   Connect to Supabase (replacing mock data) for real-time listing discovery.

### Phase 7: Search & Filtering
*   **Goal:** Allow customers to find specific products, shops, and services.
*   **Tasks:**
    *   Implement debounced global search.
    *   Add typo tolerance and multi-language support (Hindi/English matching if supported by DB/Search provider).
    *   Implement filters (category, price, distance, rating, availability).
    *   Implement sorting logic (distance, price, rating).

### Phase 8: Shop & Product Discovery (Detailed)
*   **Goal:** Detailed views for shops and their offerings.
*   **Tasks:**
    *   Implement the Shop Profile screen (details, photos, hours, verification, products).
    *   Implement the Product Detail screen.
    *   Allow cross-shop price comparisons for the same product.

### Phase 9: Contact, Calling & Messaging
*   **Goal:** Enable secure communication between customers and providers.
*   **Tasks:**
    *   Implement native calling capabilities (`tel:` links with proper permission handling).
    *   Build a real-time messaging interface (using Supabase Realtime) for chat between Customer ↔ Shop and Customer ↔ Service Provider.
    *   Implement text and basic image attachment support in chat.

### Phase 10: Reservation & Booking (Products)
*   **Goal:** Allow customers to reserve products at local shops.
*   **Tasks:**
    *   Implement the ₹10 reservation flow.
    *   Ensure server-side validation for reservations (no client-side price trusting).
    *   Build the reservation state machine (Active, Picked Up, Expired, Cancelled, Refunded).

### Phase 11: Service Marketplace & Booking
*   **Goal:** Allow customers to book local professionals (plumbers, electricians, etc.).
*   **Tasks:**
    *   Implement Service Provider profile screens.
    *   Build the Service Booking flow: upload photo -> add location -> select time -> request service.
    *   Implement the bidding mechanism where providers can bid on requests.
    *   Build the explicit server-side state machine for service jobs (Open, Bidding, Assigned, Solved, Cancelled).

### Phase 12: Customer Profile & Order Management
*   **Goal:** Allow customers to manage their account and history.
*   **Tasks:**
    *   Implement Profile screen (name, photo, addresses, settings).
    *   Implement "My Bookings" / "My Reservations" screens to track active and past orders.
    *   Add rating and review submission for completed jobs/reservations.

### Phase 13: Partner Application Foundation
*   **Goal:** Establish the core UI architecture for the Partner app.
*   **Tasks:**
    *   Set up `expo-router` with distinct navigation stacks for Vendor and Agent roles.
    *   Implement the Partner-specific UI theme.

### Phase 14: Vendor Dashboard & Management
*   **Goal:** Allow shop owners to manage their business.
*   **Tasks:**
    *   Implement the Vendor Home dashboard (today's activity, orders, messages, earnings).
    *   Build the Shop Profile management screen (update hours, photos, address).
    *   Implement Product/Inventory management (add/edit products, update availability, update prices).
    *   Implement Order/Reservation management (accept, reject, mark ready).

### Phase 15: Agent Dashboard & KYC
*   **Goal:** Allow agents to onboard new shops.
*   **Tasks:**
    *   Implement the Agent Home dashboard (commission, earnings, performance).
    *   Build the Shop Onboarding flow (register new shops, capture location/photos).
    *   Implement the KYC workflow with explicit states (Draft, Pending, Approved, Rejected).
    *   Ensure security controls so agents cannot approve their own KYC.

### Phase 16: Notifications & Trust Systems
*   **Goal:** Keep users informed and maintain platform integrity.
*   **Tasks:**
    *   Implement Push Notifications (`expo-notifications`) for critical events (booking accepted, new message, reservation ready).
    *   Implement in-app notification center.
    *   Integrate the Pehchan Score display and calculation logic.
    *   Implement abuse reporting mechanisms.

### Phase 17: Security Hardening & Performance
*   **Goal:** Ensure the app is secure and fast for Indian mobile networks.
*   **Tasks:**
    *   Review and lock down all Supabase RLS policies.
    *   Implement API rate limiting and input validation.
    *   Optimize images, implement lazy loading, and configure pagination for all lists.
    *   Test offline/poor network states.

### Phase 18: Testing & Release
*   **Goal:** Prepare for production deployment.
*   **Tasks:**
    *   Write automated tests for critical flows (Auth, Reservation, Service Booking, KYC).
    *   Perform manual Android device testing (permissions, back button, keyboard).
    *   Generate signed Android release build (AAB/APK).
    *   Prepare for Play Store submission.

---

## 3. Milestones
- **Milestone 1:** Monorepo setup and Shared Libraries complete. (Ensures existing web app stability)
- **Milestone 2:** Database Migrations and Auth complete.
- **Milestone 3:** Customer App MVP (Home, Search, Reservation).
- **Milestone 4:** Partner App MVP (Vendor Dashboard, Agent Onboarding).
- **Milestone 5:** Production Release Candidate (Android).
