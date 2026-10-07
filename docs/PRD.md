# Product Requirements Document (PRD)
**Project Name:** Phechan wale
**Target Launch City:** Patna
**Document Status:** Draft - MVP Version 1

---

## 1. Executive Summary
Phechan wale is a hyperlocal marketplace platform designed to bridge the gap between local retail shops and customers in Patna. The platform enables customers to discover products from nearby stores, compare prices, and order items for delivery (with both online and Cash on Delivery options). By digitizing the local retail ecosystem, Phechan wale aims to empower small businesses and offer unparalleled convenience and transparency to local shoppers.

## 2. Vision
To digitize and empower every local retail shop, creating a seamless, transparent, and hyperlocal shopping experience that supports community commerce and connects buyers directly with their trusted neighborhood stores.

## 3. Problem Statement
Currently, customers in Patna lack a centralized platform to check the availability and pricing of everyday products in their local neighborhood shops, leading to wasted time physically visiting multiple stores. Conversely, small retail shop owners struggle to compete with large e-commerce giants due to a lack of digital presence, tools to broadcast local offers, and streamlined online delivery channels.

## 4. Business Goals
- Onboard 500 local retail shops in Patna within the first 3 months post-launch.
- Achieve 5,000 monthly active users (MAU) and process 10,000 transactions per month.
- Establish a 15% month-over-month growth rate in Gross Merchandise Value (GMV).
- Achieve an average order fulfillment time of under 2 hours for local deliveries.

## 5. User Personas
### 5.1 The Local Customer (e.g., Rohan, 28, Tech-savvy Professional)
- **Needs:** Wants to buy electronics or groceries quickly without waiting 2-3 days for typical e-commerce delivery. Wants to compare prices among local vendors before making a purchase.
- **Pain Points:** Wasting time visiting multiple shops to find a specific item. Uncertainty about local stock availability.

### 5.2 The Small Retail Shop Owner (e.g., Gupta ji, 50, Store Owner)
- **Needs:** Wants to increase daily sales, reach a wider audience in his locality, and clear out inventory using offers.
- **Pain Points:** Cannot afford to build a standalone app. Lacks technical expertise to manage complex e-commerce logistics.

### 5.3 The Platform Administrator
- **Needs:** To moderate the platform, approve legitimate shops, resolve disputes, and monitor business metrics to ensure platform health.

## 6. User Stories
- **As a Customer**, I want to search for a specific product, so I can see which nearby shops have it in stock and compare their prices.
- **As a Customer**, I want to choose Cash on Delivery at checkout, so I can inspect the product before paying.
- **As a Shop Owner**, I want to easily upload my product inventory, so customers can view what I currently sell.
- **As a Shop Owner**, I want to display promotional banners for local offers, so I can attract more buyers to my digital storefront.
- **As an Admin**, I want to review and approve shop registrations, so I can ensure only legitimate businesses join the platform.

## 7. Functional Requirements
- **Authentication:** Phone number/OTP-based login for Customers and Shop Owners.
- **Shop Registration & Admin Approval:** Form for shop owners to submit business details (GST, address, category). Admin dashboard to approve/reject applications.
- **Product Management:** Shop owners can add, edit, and delete products (images, price, description, stock status).
- **Search & Discovery:** Customers can search for products, filter by distance, and compare prices across nearby shops.
- **Shop Pages:** Dedicated public profile for each shop listing all available products.
- **Cart & Checkout:** Multi-item cart capabilities. Secure checkout flow capturing the delivery address.
- **Payments:** Integration with a payment gateway (e.g., Razorpay/PayU) for online payments, alongside a Cash on Delivery (COD) option.
- **Offer Banner:** Dedicated space on the home screen and shop pages to highlight active promotions.
- **Notifications:** Push/SMS notifications for order placement, confirmation, dispatch, and delivery.
- **Order History:** Customers and shop owners can view past and active orders.

## 8. Non-functional Requirements
- **Performance:** Search results must load in < 2 seconds on a standard 4G network.
- **Scalability:** Architecture must support up to 10,000 concurrent users.
- **Security:** All Personally Identifiable Information (PII) and payment data must be encrypted in transit (TLS 1.3) and at rest.
- **Availability:** 99.9% uptime SLA.
- **Localization:** UI should intuitively support both English and Hindi for ease of use in Patna.

## 9. Screen List
1. Splash Screen
2. Login / OTP Verification Screen
3. Home Screen (Search bar, Categories, Offer Banners)
4. Search Results & Price Comparison Screen
5. Shop Profile Page (List of products)
6. Product Detail Page
7. Cart Screen
8. Checkout & Payment Selection Screen
9. Order Confirmation Screen
10. Order History / Tracking Screen
11. Shop Owner Dashboard (Active orders, Sales summary)
12. Inventory Management Screen (Add/Edit Product)
13. Admin Dashboard (Web-based: Approvals, Analytics)

## 10. Navigation Flow
- **Customer Flow:** App Open -> Home Screen -> Search/Select Product -> View Shop/Compare -> Add to Cart -> Checkout -> Select Payment -> Order Confirmed -> Track Order.
- **Shop Owner Flow:** App Open -> Login -> Dashboard -> Manage Inventory OR View Active Orders -> Update Order Status.

## 11. Roles & Permissions
- **Customer:** Browse products, place orders, track orders, manage personal profile.
- **Shop Owner (Vendor):** Manage own inventory, process received orders, view own financial metrics.
- **Super Admin:** Approve/reject shop registrations, manage all users, oversee global platform metrics, handle disputes.

## 12. Success Metrics
- **Acquisition:** Number of registered shops, App install rate.
- **Activation:** Percentage of registered shops uploading >10 products within the first week.
- **Engagement:** Average search queries per user per week, Add-to-cart rate.
- **Retention:** Repeat purchase rate within 30 days.
- **Monetization:** Total GMV, Payment gateway success rate.

## 13. Future Features (Post-MVP)
- Delivery partner integration (Swiggy Genie/Dunzo style independent fleet).
- AI-based product recommendations.
- In-app chat between customer and shop owner.
- Customer reviews and shop ratings.
- Subscription models for premium shop placements.

## 14. Risks & Mitigations
- **Supply-Side Adoption:** Low digital literacy among local shop owners in Patna may slow down inventory uploading. 
  - *Mitigation:* Provide localized video tutorials and initial manual onboarding support.
- **Logistics:** The MVP relies on shop owners to fulfill deliveries if a dedicated fleet isn't present. 
  - *Mitigation:* Clearly set delivery radius limits (e.g., 3-5 km) to make self-delivery feasible.
- **Fraud:** High risk of fake orders with COD. 
  - *Mitigation:* Implement OTP verification upon delivery and track user order rejection rates (banning egregious accounts).

## 15. MVP Scope
The MVP will strictly focus on connecting buyers to sellers in Patna. It is limited to: Customer Login, Shop Registration, Admin Approval, Product Upload, Search Products, Shop Pages, Cart, Checkout (COD & Online), Offer Banners, Notifications, Order History, and the Admin Dashboard.

## 16. Out of Scope (For MVP)
- Dedicated delivery fleet management app.
- Complex loyalty programs or point systems.
- Advanced analytics reporting for shop owners.
- Multi-city rollout (Strictly geo-fenced to Patna).
