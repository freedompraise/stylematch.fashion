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
- **VendorContext**: Single source of truth for vendor authentication, profile data and session management


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

## Future Considerations
1. **Performance Optimization**
   - Implement service workers
   - Add offline support
   - Further optimize bundle size

2. **Feature Additions**
   - Advanced analytics
   - Inventory management
   - Multi-language support

3. **Integration Expansions**
   - Additional payment gateways
   - Social media integration
   - Marketing tools

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