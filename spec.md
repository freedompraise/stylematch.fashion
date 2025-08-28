# StyleMatch Buyer Storefront & Purchase Flow — Specification

## Objective
Build a scalable, responsive, and vendor-personalized storefront experience for buyers to:
- View vendor-specific products and details
- Interact with listings (search, filter, wishlist, cart)
- Place orders and complete payments via Paystack
- All tied to a specific vendor's public-facing store

**Note:** The existing `src/pages/Storefront.tsx` UI will be refactored and extended, not rebuilt from scratch.

---

## Key Responsibilities
- **Vendor identity resolution**: Resolve vendor by slug in URL (e.g., `/store/:vendorSlug`)
- **Product fetching**: Fetch and display only products for the resolved vendor
- **Buyer interaction**: Enable product search, filter, wishlist (v2), cart, and product detail view
- **Order creation & checkout**: Allow buyers to add to cart, input delivery info, and create orders
- **Delivery options**: Collect delivery address and options at checkout; **Pickup is required for v1**
- **Paystack integration**: Initiate and verify payments for orders
- **Payment split**: 2% to platform, 98% to vendor via Paystack subaccounts (see below)
- **Confirmation & fallback**: Show order/payment success, error, and loading states

---

## Architecture Overview

```mermaid
graph TD;
  A[Public Storefront Route /store/:vendorSlug] --> B[Resolve Vendor by Slug]
  B --> C[Fetch Vendor Profile & Products]
  C --> D[Storefront UI (Storefront.tsx)]
  D --> E[Product Detail Modal/Page]
  D --> F[Cart State (React Context/LocalStorage)]
  F --> G[Checkout Page]
  G --> H[Order Creation (Supabase)]
  G --> I[Paystack Payment Init]
  I --> J[Paystack Payment Verification]
  J --> K[Order Status Update]
  K --> L[Order Confirmation Screen]
```

- **Stateless for buyers**: No login required in v1; architecture should allow for future buyer accounts (wishlist, order history, etc.)
- **Public routes**: `/store/:vendorSlug`, `/store/:vendorSlug/product/:productId`, `/store/:vendorSlug/checkout`, `/store/:vendorSlug/confirmation`
- **Data fetching**: Centralized hooks/services for vendor/product data
- **Cart**: Local state (React Context or localStorage)
- **Order flow**: Cart → Delivery Info (with Pickup option) → Paystack → Confirmation

---

## API/Data Requirements

### Product Display
- Fields: `id`, `name`, `description`, `price`, `discount_price`, `images`, `category`, `sizes`, `colors`, `stock_quantity`, `vendor_id`

### Vendor Display
- Fields: `store_name`, `store_slug`, `bio`, `banner_image_url`, `instagram_url`, `facebook_url`, `wabusiness_url`, `payout_info`

### Order Creation
- Structure:
  - `vendor_id`
  - `items: [{ product_id, quantity, size, color, price }]`
  - `delivery_location`, `delivery_date` (optional)
  - `customer_info: { name, phone, email, address }`
  - `total_amount`
  - `paystack_reference`
  - `status` (pending, confirmed, etc.)
  - `delivery_method` (e.g., 'pickup')

**Note:** Recommend updating `OrderSchema` to support multiple items per order (array of order items).

### Paystack Integration
- On checkout, generate unique reference and initialize payment
- Store Paystack reference in order row
- On payment callback, verify transaction and update order status
- **Payment split:**
  - 2% of order total to platform account
  - 98% to vendor via Paystack subaccount
  - Subaccount must be created automatically using `payout_info` in `VendorProfile` (see [Paystack Subaccounts](https://paystack.com/docs/api/#subaccounts)).
  - If subaccount does not exist, create it on first order for vendor.
- **No need to send confirmation emails/SMS** — Paystack handles this automatically.

---

## Components/Pages to Build/Refactor
- **Storefront Homepage** (`Storefront.tsx`): Banner, vendor bio, product listings, search/filter, cart, wishlist (v2)
- **Product Detail Modal/Page**: Image carousel, description, add to cart, select size/color
- **Cart Drawer/Page**: Item summary, quantity, remove, subtotal, proceed to checkout
- **Checkout Page**: Delivery info (with Pickup option), order summary, Paystack payment button
- **Order Confirmation Page**: Success/failure, order details, next steps
- **Error/Loading States**: For vendor not found, no products, payment errors, etc.

---

## Supabase Role
- **Read-only**: Vendor and product data (public access)
- **Write**: Orders table (create on checkout)
- **Order row**: Store Paystack reference, status, and buyer info
- **Policies**: Public can read vendors/products, only create orders
- **Vendor payout info**: Store `payout_info` in `VendorProfile` for subaccount creation

---

## Buyer Interaction Features
- **Wishlist**: v2 (localStorage or Supabase if/when buyers can log in)
- **Reviews**: v2 (not in v1 scope)
- **Prepare for buyer accounts**: Structure code to allow future buyer authentication, wishlist, and order history

---

## Routing Structure
- `/store/:vendorSlug` — Storefront homepage
- `/store/:vendorSlug/product/:productId` — Product detail (modal or page)
- `/store/:vendorSlug/checkout` — Cart/checkout
- `/store/:vendorSlug/confirmation` — Order/payment confirmation

---

## Dev Notes / TODOs
- [ ] Refactor `Storefront.tsx` to fetch vendor/products by slug, not use sample data
- [ ] Add graceful loading and error fallback for missing vendor/products
- [ ] Centralize vendor/product data fetching in hooks/services
- [ ] Cart state: use React Context or localStorage for persistence
- [ ] Update order schema to support multiple items
- [ ] Move Paystack secret key usage to backend (security)
- [ ] Add delivery info form at checkout (with Pickup option)
- [ ] Handle Paystack payment callback/verification
- [ ] Implement automatic Paystack subaccount creation for vendors using `payout_info` (see [Paystack Subaccounts](https://paystack.com/docs/api/#subaccounts))
- [ ] Implement payment split (2% platform, 98% vendor) in Paystack transaction initialization
- [ ] Prepare for future discoverability/global search (v2)
- [ ] Document all new/changed types in `src/types/index.ts`

---

## Out of Scope for v1
- Buyer authentication (but code should be ready for it)
- Reviews/ratings
- Global product discovery (cross-vendor)
- Vendor dashboard changes

---

## Open Questions
- Should buyers receive email/SMS confirmation? **No — Paystack handles this.**
- Should we support guest checkout only, or prepare for future buyer accounts? **Prepare for future buyer accounts.**
- What delivery options (pickup, shipping, etc.) are required for v1? **Pickup is required for v1.**
- How to handle subaccount creation failures or missing payout info? (Show error, block checkout, or fallback to platform account?)

---

## Reference Paystack Docs
- [Paystack Subaccounts](https://paystack.com/docs/api/#subaccounts) 