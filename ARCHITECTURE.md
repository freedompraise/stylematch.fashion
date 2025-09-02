# Architectural Documentation for StyleMatch Frontend

## Overview

StyleMatch is a frontend application designed to transform local fashion vendors' businesses into credible online stores. The application is built using modern web technologies and follows a modular, context-based architecture focused on separation of concerns.

## Technologies Used

- **Framework**: React (with Vite for development)
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Context API with custom hooks
- **Form Handling**: React Hook Form + Zod validation
- **API Communication**: Supabase Client
- **Image Management**: Cloudinary
- **Payment Processing**: Paystack
- **Routing**: React Router DOM
- **Analytics**: Recharts
- **Authentication**: Supabase Auth + Google OAuth

## Core Architectural Principles

1. **Zustand-Based State Management**

   - **Separation of Concerns**: Dedicated stores for distinct domains: `AuthStore` for authentication, `VendorStore` for vendor profile and business data (products, orders), and `VendorDataService` for business operations.
   - **Route-Based Loading**: Vendor data is loaded only when accessing vendor routes, preventing premature API calls and improving performance.
   - **Intelligent Caching**: Route-specific caching with automatic invalidation ensures data freshness while minimizing API calls.
   - **Clean Data Flow**: UI components consume data from stores, which communicate with a dedicated service layer for external API calls.

2. **Type Safety**

   - Strict TypeScript implementation
   - Zod schemas for runtime validation
   - Proper type definitions for all entities

3. **Component Architecture**
   - Small, focused components (<220 lines)
   - Reusable UI primitives
   - Clear separation of layout and feature components

## Folder Structure

```
.
├── components/           # Reusable UI components
│   ├── ui/              # UI primitives (from shadcn/ui)
│   ├── auth/            # Auth-specific components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layouts/         # Layout components
│   └── vendor/          # Vendor-specific components
├── stores/              # Zustand State Stores
│   ├── authStore.ts     # Manages user authentication and session
│   ├── vendorStore.ts   # Manages vendor profile with route-based loading
│   ├── buyerStore.ts    # Manages buyer cart and state
│   ├── marketplaceStore.ts # Manages marketplace data
│   └── uiStore.ts       # Manages UI state
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities & clients
├── pages/               # Route components
├── types/               # TypeScript definitions & schemas
└── services/            # Business logic and external API communication
```

## Key Modules & State Flow

The application's state management is built on Zustand stores with route-based loading for optimal performance and clean separation of concerns.

### Store Architecture

#### 1. `AuthStore`

This is the foundation of the authentication system and the single source of truth for the user's session state.

- **Responsibilities**:
  - Holds the current `user` and `session` objects from Supabase.
  - Exposes `signIn`, `signUp`, and `signOut` methods that call the `authService`.
  - Tracks whether the current authentication flow is for a vendor signup (`isVendorSignup` flag).
  - It has no knowledge of vendor-specific data.
- **Consumed By**: All authentication pages and route guards.

#### 2. `VendorStore`

This store manages the profile, identity, and business data of a vendor with route-based loading.

- **Responsibilities**:
  - Loads vendor profile only when accessing vendor routes via `loadVendorForRoute(userId, route)`.
  - Provides methods to create and update the vendor profile by calling the `vendorProfileService`.
  - Manages the vendor's onboarding state.
  - Stores products and orders data with loading states.
  - Implements intelligent caching with route-specific invalidation.
- **Consumes**: `AuthStore` (to get the authenticated user).
- **Consumed By**: All authenticated vendor pages via `VendorRouteGuard`.

#### 3. `VendorDataService`

This service handles all business-related data operations for vendors.

- **Responsibilities**:
  - Pure service functions for vendor business operations
  - Handles all Supabase calls for products and orders
  - Provides CRUD operations for vendor business data
  - Keeps stores clean by handling "dirty" database operations
- **Consumes**: `VendorStore` (to get the `vendor.user_id` for API calls).
- **Consumed By**: `ProductManagement.tsx`, `OrderManagement.tsx`, `VendorDashboard.tsx`.

### Route-Based Loading

The application implements a sophisticated route-based loading system that prevents premature vendor data fetching:

- **VendorRouteGuard**: Each vendor route is wrapped with this component that loads vendor data only when needed.
- **Route-Specific Caching**: Vendor data is cached per route with intelligent invalidation.
- **No Global Initialization**: Vendor data is never loaded globally, only when accessing vendor routes.
- **Clean Separation**: Auth and vendor concerns are completely separated.

### Components

1. **UI Components** (`components/ui/`)

   - Shadcn/ui based components
   - Custom form components
   - Dialog and modal components

2. **Vendor Components** (`components/vendor/`)
   - DashboardStats: Analytics and metrics
   - SalesChart: Revenue visualization
   - TopProducts: Best-selling items
   - RecentOrders: Latest order management

### Services

- **Supabase Integration**
- **Store Slug Generation**: Automatic generation of unique, URL-friendly store slugs from store names with validation and uniqueness checking

  - Real-time data synchronization
  - Row Level Security (RLS) policies
  - Storage management

- **Cloudinary Integration**

  - Image optimization
  - Secure upload handling
  - CDN delivery

- **Paystack Integration**
  - Secure payment processing
  - Payout management
  - Transaction handling

### Pages

1. **Authentication**

   - Login/Register with email
   - Google OAuth integration
   - Password reset flow

2. **Vendor Dashboard**

   - Analytics overview
   - Product management
   - Order processing
   - Store settings

3. **Settings**
   - Profile management
   - Store customization
   - Payout settings
   - Security settings

## State Management

- **Zustand-based architecture** for global state management
- **Route-based loading** for optimal performance
- **Intelligent caching** with route-specific invalidation
- **Clean separation** between auth and vendor concerns
- **Local state** for component-specific data

## Form Handling

- React Hook Form for form state
- Zod schemas for validation
- Custom form actions and error handling

## Image Management

- Cloudinary for image storage and optimization
- Lazy loading for performance
- Responsive image handling

## Security

- JWT-based authentication
- Secure file uploads
- Input sanitization
- Rate limiting

## Error Handling

- Global error boundary
- Context-specific error states
- User-friendly error messages
- Toast notifications

## Environment Configuration

Required environment variables:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_API_KEY=
VITE_CLOUDINARY_API_SECRET=
VITE_PAYSTACK_PUBLIC_KEY=
VITE_PAYSTACK_SECRET_KEY=
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_CLIENT_SECRET=
```

## Development Guidelines

1. **Component Structure**

   - Keep components under 220 lines
   - Use TypeScript for all new code
   - Follow the established naming conventions

2. **State Management**

   - Use appropriate context for global state
   - Keep component state minimal
   - Avoid prop drilling

3. **Styling**

   - Use Tailwind CSS utility classes
   - Follow the design system
   - Maintain responsive design

4. **Performance**
   - Lazy load non-critical components
   - Optimize image delivery
   - Monitor bundle size

## Testing Strategy

- Unit tests for utilities and hooks
- Integration tests for complex features
- E2E tests for critical user flows

## Deployment

- Vercel for hosting
- Automated CI/CD pipeline
- Environment-based configurations

## Data Management Patterns

### 1. Service Layer Pattern

The application implements a robust service layer pattern with clear responsibilities:

```typescript
// VendorProfileService example
class VendorProfileService {
  async createVendorProfile(
    userId: string,
    profile: CreateVendorProfileInput
  ): Promise<VendorProfile>;
  async getVendorProfile(
    userId: string,
    options?: { force?: boolean }
  ): Promise<VendorProfile | null>;
  async updateVendorProfile(
    userId: string,
    updates: Partial<VendorProfile>
  ): Promise<VendorProfile>;
  async deleteVendorProfile(userId: string): Promise<void>;
  async verifyVendor(userId: string): Promise<VendorProfile>;
  async rejectVendor(userId: string, reason: string): Promise<VendorProfile>;
  async getPendingVendors(): Promise<VendorProfile[]>;
}
```

### 2. Transaction Safety Pattern

```typescript
// Example from VendorProfileService
async updateVendorProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile> {
  // Pre-transaction preparation
  if (updates.banner_image_url) {
    try {
      const currentProfile = await this.getVendorProfile(userId);
      if (currentProfile?.banner_image_url) {
        await deleteFromCloudinary(currentProfile.banner_image_url);
      }
    } catch (error) {
      // Handle cleanup failure gracefully
      console.error('Error in pre-transaction cleanup:', error);
    }
  }

  // Main transaction
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  // Post-transaction cleanup on failure
  if (error) {
    if (updates.banner_image_url) {
      await this.cleanupFailedCreation(updates.banner_image_url);
    }
    throw new DatabaseError(error.message);
  }

  return data as VendorProfile;
}
```

### 3. Caching Strategy

```typescript
// Cache configuration
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const SESSION_REFRESH_THRESHOLD = 1000 * 60; // 1 minute before expiry

// Cache implementation in VendorContext
const saveToCache = useCallback((data: Partial<VendorCache>) => {
  const existing = localStorage.getItem(VENDOR_CACHE_KEY);
  const cache = existing ? JSON.parse(existing) : {};
  localStorage.setItem(
    VENDOR_CACHE_KEY,
    JSON.stringify({
      ...cache,
      ...data,
      timestamp: Date.now(),
    })
  );
}, []);
```

### 4. Validation Pattern

```typescript
// Zod schema validation
const createVendorProfileSchema = z.object({
  store_name: z.string().min(2, "Store name required"),
  name: z.string().min(2, "Owner name required"),
  bio: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  wabusiness_url: z.string().optional(),
  banner_image_url: z.string().optional(),
  phone: z.string().optional(),
  payout_info: z.any().optional(),
  verification_status: z.enum(["pending", "verified", "rejected"]),
  rejection_reason: z.string().optional(),
});
```

### 5. Error Handling Pattern

```typescript
class VendorServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Specific error types
class ValidationError extends VendorServiceError {}
class NotFoundError extends VendorServiceError {}
class DatabaseError extends VendorServiceError {}
```

## Future Considerations

1. **Performance Optimization**

   - Implement service workers
   - Add offline support
   - Further optimize bundle size
   - Add request queuing for poor connections
   - Enhance caching strategies

2. **Feature Additions**

   - Advanced analytics
   - Inventory management
   - Multi-language support
   - Real-time order updates
   - Live chat support
   - Bulk operations support

3. **Integration Expansions**

   - Additional payment gateways
   - Social media integration
   - Marketing tools
   - Enhanced analytics dashboard
   - Advanced search capabilities

4. **Security Enhancements**
   - Implement rate limiting
   - Add 2FA support
   - Enhanced session management
   - Improved transaction safety

## Revised Authentication Flow

The authentication flow has been redesigned to implement route-based loading and clean separation of concerns.

### Auth Flow Overview

```
1. App Initialization
   ↓
2. AuthStore Initialization (only auth state)
   ↓
3. User Authentication
   ↓
4. Route-Based Vendor Loading (only when needed)
   ↓
5. Vendor Profile Management
```

### Detailed Flow

#### 1. **App Initialization**

```typescript
// App.tsx - Only initializes auth, no vendor loading
useEffect(() => {
  const subscription = initializeAuth();
  return () => subscription?.unsubscribe();
}, []);
```

#### 2. **AuthStore Initialization**

- **Purpose**: Initialize authentication state only
- **What it does**:
  - Sets up Supabase auth listener
  - Restores session from localStorage
  - Sets loading state to false
- **What it doesn't do**: No vendor profile loading

#### 3. **User Authentication**

- **Login Flow**:

  1. User enters credentials on `/auth`
  2. `AuthStore.signIn()` calls `authService.signIn()`
  3. Supabase authenticates user
  4. `AuthStore` updates with new session/user
  5. User redirected to intended destination

- **Signup Flow**:
  1. User registers on `/auth`
  2. `AuthStore.signUp()` calls `authService.signUp()`
  3. Email verification sent
  4. User completes verification
  5. User redirected to onboarding

#### 4. **Route-Based Vendor Loading**

**For Public Routes** (/, /auth, /store/:slug):

- No vendor data loaded
- Only auth state available

**For Vendor Routes** (/vendor/\*):

- `VendorRouteGuard` component wraps each route
- Calls `loadVendorForRoute(userId, route)` only when accessing vendor routes
- Checks cache first, then fetches from database if needed
- Redirects to onboarding if no vendor profile exists

**For Onboarding Route** (/vendor/onboarding):

- Only requires authentication
- No vendor profile required
- User can complete onboarding process

#### 5. **Vendor Profile Management**

**Profile Creation**:

```typescript
// VendorOnboarding.tsx
const { user } = useAuthStore(); // Get user from auth store
const { createVendorProfile } = useVendorStore(); // Create profile

// After successful creation, user can access vendor routes
```

**Profile Updates**:

```typescript
// Settings pages
const { updateVendorProfile } = useVendorStore();
// Updates both database and cache
```

### Route Protection Strategy

#### **AuthRoute** (for /auth pages)

```typescript
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/vendor/dashboard" />;

  return <>{children}</>;
};
```

#### **VendorRouteGuard** (for vendor pages)

```typescript
const VendorRouteGuard = ({ children, route }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { vendor, loading, loadVendorForRoute } = useVendorStore();

  // Load vendor data only when needed
  useEffect(() => {
    if (user?.id && !vendor && !loading) {
      loadVendorForRoute(user.id, route);
    }
  }, [user?.id, route]);

  // Handle different states
  if (!isAuthenticated) return <Navigate to="/auth" />;
  if (loading) return <LoadingSpinner />;
  if (!vendor) return <Navigate to="/vendor/onboarding" />;

  return <>{children}</>;
};
```

### State Management Flow

```
AuthStore (Auth State Only)
    ↓
User Authentication
    ↓
Route Access
    ↓
VendorRouteGuard (Loads vendor data only when needed)
    ↓
VendorStore (Route-specific caching)
    ↓
VendorDataService (Business operations)
```

### Key Benefits of Revised Flow

1. **No Premature Loading**: Vendor data only loads when accessing vendor routes
2. **Clean Separation**: Auth and vendor concerns are completely separate
3. **Efficient Caching**: Route-specific caching prevents unnecessary API calls
4. **Better Performance**: No global vendor initialization on app load
5. **Error Prevention**: Eliminates 406 errors and redirect loops
6. **Maintainable**: Each component has a single responsibility

### Error Handling

**Auth Errors**:

- Handled by `AuthStore`
- User-friendly error messages
- Redirect to auth page if session invalid

**Vendor Errors**:

- Handled by `VendorRouteGuard`
- Distinguishes between missing profile (expected) and real errors
- Graceful fallback to onboarding

**Network Errors**:

- Retry mechanisms in service layer
- Fallback to cached data when possible
- User notification via toast messages

## Buyer Storefront & Purchase Flow (2025 July Update)

### Contexts & State

- **BuyerVendorContext**: Provides vendor profile and products by slug for all buyer-facing pages. Ensures a single DB call and shared state across Storefront, ProductDetail, Checkout, and Confirmation. No dependency on vendor session or VendorContext.
- **CartContext**: Manages buyer cart state, persisted in localStorage. Exposes add/remove/update/clear and total calculation. Used in Storefront, ProductDetail, and Checkout.

### Service Layer

- **buyerStorefrontService.ts**: Contains all buyer-facing data logic (fetch vendor, fetch products, create order, get vendor subaccount for Paystack split). No vendor session/context dependency.
- **Order/Payment**: On checkout, creates order in Supabase, fetches vendor subaccount via RPC, and initializes Paystack payment with split (2% platform, 98% vendor). Handles payment callback and updates order status.

### Buyer Page Flow

1. **/store/:vendorSlug**: Storefront page, shows vendor info and products from BuyerVendorContext.
2. **/store/:vendorSlug/product/:productId**: Product detail, uses context for vendor/product, no extra DB call.
3. **/store/:vendorSlug/checkout**: Uses context for vendor, products, and cart. Collects delivery info, creates order, and initiates payment.
4. **/store/:vendorSlug/confirmation**: Fetches order by ID, shows payment/order status.

### Decoupling

- All buyer-facing logic is fully decoupled from vendor session/context. No useVendor or VendorContext is used in buyer pages, hooks, or services.
- BuyerVendorContext is only initialized at the /store/:vendorSlug route level and is independent of authentication/session.

### Extensibility

- Delivery info and methods are extensible for future delivery service integration.
- Cart and order types are centralized in types/index.ts for maintainability.
- Payment split logic is handled via Supabase RPC for vendor subaccount.

### Data Access & Supabase Calls

- All Supabase/database calls for buyer flows are encapsulated in service modules (e.g., buyerStorefrontService.ts). UI components and pages do not make direct Supabase calls; they only use hooks/services for data access. This ensures strict separation of concerns and maintainability.
