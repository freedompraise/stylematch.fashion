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
1. **Context-Based State Management**
   - **Separation of Concerns**: Dedicated contexts for distinct domains: `AuthContext` for authentication, `VendorContext` for vendor profile data, and `VendorDataProvider` for business data (products, orders).
   - **Clear Data Flow**: UI components consume data from contexts, which in turn communicate with a dedicated service layer for external API calls.
   - **Centralized Logic**: Each context serves as a single source of truth for its domain, centralizing state management logic and reducing component complexity.

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
├── contexts/            # React Context Providers
│   ├── AuthContext      # Manages user authentication and session
│   └── VendorContext    # Manages vendor profile and data providers
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities & clients
├── pages/               # Route components
├── types/               # TypeScript definitions & schemas
└── services/            # Business logic and external API communication
```

## Key Modules & State Flow

The application's state management is divided into three main contexts that work together, each with a distinct responsibility. This architecture ensures a clean separation between authentication, user profile management, and business data handling.

### Context Providers Explained

#### 1. `AuthContext`
This is the foundation of the authentication system and the single source of truth for the user's session state.
- **Responsibilities**:
  - Holds the current `user` and `session` objects from Supabase.
  - Exposes `signIn`, `signUp`, and `signOut` methods that call the `authService`.
  - Tracks whether the current authentication flow is for a vendor signup (`isVendorSignup` flag).
  - It has no knowledge of vendor-specific data.
- **Consumed By**: `VendorContext`, all authentication pages (`Auth.tsx`, `verification-complete.tsx`), and route guards.

#### 2. `VendorContext`
This context manages the profile and identity of a vendor. It builds upon `AuthContext`.
- **Responsibilities**:
  - Fetches and holds the `vendor` profile from the database using the `user.id` from `AuthContext`.
  - Provides methods to create and update the vendor profile by calling the `vendorProfileService`.
  - Manages the vendor's onboarding state.
- **Consumes**: `AuthContext` (to get the authenticated user).
- **Consumed By**: All authenticated vendor pages and the `VendorDataProvider`.

#### 3. `VendorDataProvider`
This provider handles all business-related data for a logged-in vendor.
- **Responsibilities**:
  - Manages collections of `products` and `orders`.
  - Provides functions to fetch, create, update, and delete products and orders.
  - Calculates vendor statistics (`getVendorStats`).
- **Consumes**: `VendorContext` (to get the `vendor.user_id` for API calls).
- **Consumed By**: `ProductManagement.tsx`, `OrderManagement.tsx`, `VendorDashboard.tsx`.

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
- Context-based architecture for global state
- React Query for server state management
- Local state for component-specific data

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
  async createVendorProfile(userId: string, profile: CreateVendorProfileInput): Promise<VendorProfile>;
  async getVendorProfile(userId: string, options?: { force?: boolean }): Promise<VendorProfile | null>;
  async updateVendorProfile(userId: string, updates: Partial<VendorProfile>): Promise<VendorProfile>;
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
  localStorage.setItem(VENDOR_CACHE_KEY, JSON.stringify({
    ...cache,
    ...data,
    timestamp: Date.now()
  }));
}, []);
```

### 4. Validation Pattern
```typescript
// Zod schema validation
const createVendorProfileSchema = z.object({
  store_name: z.string().min(2, 'Store name required'),
  name: z.string().min(2, 'Owner name required'),
  bio: z.string().optional(),
  instagram_url: z.string().optional(),
  facebook_url: z.string().optional(),
  wabusiness_url: z.string().optional(),
  banner_image_url: z.string().optional(),
  phone: z.string().optional(),
  payout_info: z.any().optional(),
  verification_status: z.enum(['pending', 'verified', 'rejected']),
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

## Core State Management

### VendorContext
VendorContext serves as the central hub for vendor authentication and data management:

1. **Authentication & Session**
   - Manages vendor authentication state
   - Handles session refresh and expiry
   - Integrates with Supabase Auth
   - Caches auth tokens

2. **Vendor Profile**
   - Maintains vendor profile data
   - Tracks onboarding status
   - Caches profile data with TTL
   - Handles profile updates

3. **Route Protection**
   - RequireVendor component for protected routes
   - Manages auth redirects
   - Handles onboarding flow

4. **Integration**
   - Works alongside AuthService for auth operations
   - Uses VendorDataProvider for data operations
   - Maintains local cache in localStorage

### State Flow
```
AuthService -> VendorContext -> VendorDataProvider
     ↑              ↓                  ↓
  Auth Flow     Auth State        Vendor Data
     ↑              ↓                  ↓
  Supabase     Components         Database
```

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