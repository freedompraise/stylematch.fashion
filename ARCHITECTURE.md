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
   - Separate contexts for different domains (Vendor, Product, Order)
   - Clear separation of data fetching and UI components
   - Centralized error handling and loading states

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
│   ├── dashboard/       # Dashboard-specific components
│   ├── layouts/         # Layout components
│   ├── vendor/          # Vendor-specific components
│   └── products/        # Product-related components
├── contexts/            # React Context Providers
│   ├── VendorContext   # Auth, profile & settings
│   ├── ProductContext  # Product management
│   └── OrderContext    # Order processing
├── hooks/               # Custom React hooks
├── lib/                 # Core utilities & clients
├── pages/               # Route components
├── types/              # TypeScript definitions & schemas
└── services/           # External service integrations
```

## Key Modules

### Context Providers

#### 1. VendorContext
Single source of truth for vendor authentication, profile data and session management:
```typescript
interface VendorContextType {
  vendor: VendorProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  user: User | null;
  refreshVendor: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  updateVendorProfile: (updates: Partial<VendorProfile>) => Promise<void>;
  getVendorProfile: (force?: boolean) => Promise<VendorProfile | null>;
  createVendorProfile: (profile: CreateVendorProfileInput) => Promise<void>;
}
```

#### 2. VendorDataProvider
Manages vendor's business data and operations:
```typescript
interface VendorDataContextType {
  products: Product[];
  orders: Order[];
  fetchProducts: (force?: boolean) => Promise<Product[]>;
  fetchOrders: (force?: boolean) => Promise<Order[]>;
  createProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getVendorStats: () => Promise<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  }>;
  // ... other methods
}
```


### Components
1. **UI Components** (`components/ui/`)
   - Shadcn/ui based components
   - Custom form components
   - Dialog and modal components

2. **Dashboard Components** (`components/dashboard/`)
   - DashboardStats: Analytics and metrics
   - SalesChart: Revenue visualization
   - TopProducts: Best-selling items
   - RecentOrders: Latest order management

3. **Layout Components** (`components/layouts/`)
   - VendorLayout: Main dashboard layout
   - Navbar: Navigation component
   - Footer: Global footer

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