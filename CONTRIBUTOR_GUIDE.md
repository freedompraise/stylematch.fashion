# StyleMatch Frontend - Contributor Guide

Welcome to the StyleMatch Frontend project! This guide will help you get set up and start contributing effectively.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Setup Phases](#setup-phases)
3. [Development Workflow](#development-workflow)
4. [Architecture & Code Organization](#architecture--code-organization)
5. [Styling Guidelines](#styling-guidelines)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

StyleMatch is a fashion marketplace platform that connects vendors with customers. The frontend is built with:

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for backend services
- **Cloudinary** for image management
- **Zustand** for state management
- **React Router** for navigation

### Key Features

- **Vendor Dashboard**: Product management, order handling, analytics
- **Buyer Storefront**: Product browsing, cart, checkout
- **Authentication**: Email/password and Google OAuth
- **Multi-image Product Upload**: Up to 3 images per product
- **Order Management**: Payment verification, status tracking
- **Responsive Design**: Mobile-first approach

## 🚀 Setup Phases

### Phase 1: Minimal Setup (UI Changes Only)

**Goal**: Get the project running for UI/UX changes without backend functionality.

#### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

#### Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd stylematch-frontend-bloom
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env.local
   ```

4. **Add minimal environment variables**

   ```bash
   # .env.local - Add these minimal values for UI development
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Optional for image uploads (can be dummy values for UI work)
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

**What works in Phase 1:**

- ✅ All UI components and pages
- ✅ Navigation and routing
- ✅ Styling and responsive design
- ✅ Form validation (client-side)
- ❌ Authentication (will show errors)
- ❌ Data persistence (will show errors)
- ❌ Image uploads (will fail)

### Phase 2: Full Backend Setup

**Goal**: Enable full functionality including authentication and data persistence.

#### Additional Environment Variables

```bash
# .env.local - Complete setup
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_ACCESS_TOKEN=your_service_role_key_here

# Cloudinary (for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Paystack (for payments)
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
VITE_PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema** (see `docs/database-setup.sql`)

3. **Configure authentication** in Supabase:

   - Enable email/password authentication
   - Configure Google OAuth (optional)
   - Disable email verification (as per project requirements)

4. **Set up Cloudinary** account for image storage

5. **Configure Paystack** for payment processing (optional for development)

**What works in Phase 2:**

- ✅ Full authentication flow
- ✅ Data persistence
- ✅ Image uploads
- ✅ Order management
- ✅ Payment processing (if configured)

## 🛠 Development Workflow

### Getting Started

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Follow the coding standards below
   - Test your changes thoroughly
   - Update documentation if needed

3. **Run tests and linting**

   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

#### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `imageValidation.ts`)
- Pages: `PascalCase.tsx` (e.g., `Storefront.tsx`)

#### Component Structure

```tsx
// src/components/ExampleComponent.tsx
import React from "react";
import { Button } from "@/components/ui/button";

interface ExampleComponentProps {
  title: string;
  onAction: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

#### Import Order

1. React imports
2. Third-party libraries
3. Internal components (UI first, then custom)
4. Utilities and services
5. Types

## 🏗 Architecture & Code Organization

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── buyer/          # Buyer-specific components
│   └── vendor/         # Vendor-specific components
├── pages/              # Route components
│   ├── auth/           # Authentication pages
│   ├── buyer/          # Buyer pages
│   └── vendor/         # Vendor pages
├── stores/             # Zustand state management
├── services/           # API and business logic
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── hooks/              # Custom React hooks
```

### Key Architectural Patterns

#### 1. Component Separation

- **UI Components**: Pure presentation components in `components/ui/`
- **Business Components**: Components with business logic in feature folders
- **Page Components**: Route-level components in `pages/`

#### 2. State Management

- **Zustand Stores**: Global state in `stores/`
- **Local State**: Component-level state with `useState`
- **Server State**: Managed through services, not in stores

#### 3. Service Layer

- **API Calls**: All external API calls in `services/`
- **Business Logic**: Complex logic in service functions
- **Error Handling**: Centralized error handling in services

#### 4. Data Flow

```
Component → Service → Supabase/External API
     ↓
Store (for global state)
     ↓
Component (re-renders)
```

## 🎨 Styling Guidelines

### Tailwind CSS Usage

#### Predefined Classes

Use classes from `tailwind.config.ts` and `src/index.css`:

```tsx
// Good - using predefined classes
<div className="bg-primary text-primary-foreground p-4 rounded-lg">

// Avoid - custom values unless necessary
<div className="bg-[#667eea] text-white p-4 rounded-lg">
```

#### Component Styling

```tsx
// Use class-variance-authority for component variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### Responsive Design

```tsx
// Mobile-first approach
<div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
  <div className="w-full md:w-1/2">Content</div>
  <div className="w-full md:w-1/2">Content</div>
</div>
```

### Image Handling

#### Use CloudinaryImage Component

```tsx
import CloudinaryImage from "@/components/CloudinaryImage";

<CloudinaryImage
  src="image-url"
  alt="Description"
  className="w-full h-48 object-cover"
  width={400}
  height={300}
/>;
```

#### Image Validation

```tsx
import {
  validateAndOptimizeImage,
  PRODUCT_IMAGE_CONFIG,
} from "@/utils/imageValidation";

const handleImageUpload = async (file: File) => {
  try {
    const validatedFile = await validateAndOptimizeImage(
      file,
      PRODUCT_IMAGE_CONFIG
    );
    // Process validated file
  } catch (error) {
    // Handle validation error
  }
};
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

```tsx
// src/__tests__/components/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### Testing Patterns

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows (when needed)

## 📝 Common Tasks

### Adding a New Component

1. **Create component file**

   ```bash
   touch src/components/NewComponent.tsx
   ```

2. **Add component code**

   ```tsx
   import React from "react";

   interface NewComponentProps {
     // Define props
   }

   export function NewComponent({}: NewComponentProps) {
     return <div>Component content</div>;
   }
   ```

3. **Export from index** (if needed)
   ```tsx
   // src/components/index.ts
   export { NewComponent } from "./NewComponent";
   ```

### Adding a New Page

1. **Create page file**

   ```bash
   touch src/pages/NewPage.tsx
   ```

2. **Add route in routes.tsx**

   ```tsx
   import NewPage from "./pages/NewPage";

   // Add route
   <Route path="/new-page" element={<NewPage />} />;
   ```

### Adding a New Store

1. **Create store file**

   ```bash
   touch src/stores/newStore.ts
   ```

2. **Define store with Zustand**

   ```tsx
   import { create } from "zustand";
   import { persist } from "zustand/middleware";

   interface NewStoreState {
     data: any[];
     loading: boolean;
     fetchData: () => Promise<void>;
   }

   export const useNewStore = create<NewStoreState>()(
     persist(
       (set) => ({
         data: [],
         loading: false,
         fetchData: async () => {
           set({ loading: true });
           // Fetch logic
           set({ loading: false });
         },
       }),
       { name: "new-store" }
     )
   );
   ```

3. **Export from stores/index.ts**
   ```tsx
   export { useNewStore } from "./newStore";
   ```

### Adding a New Service

1. **Create service file**

   ```bash
   touch src/services/newService.ts
   ```

2. **Define service functions**

   ```tsx
   import { supabase } from "@/lib/supabaseClient";

   export class NewService {
     static async fetchData(): Promise<any[]> {
       const { data, error } = await supabase.from("table_name").select("*");

       if (error) throw error;
       return data;
     }
   }
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

```bash
# Check if .env.local exists and has correct values
cat .env.local

# Restart development server
npm run dev
```

#### 2. Supabase Connection Issues

```bash
# Verify Supabase URL and key
# Check network connectivity
# Verify Supabase project is active
```

#### 3. Image Upload Failures

```bash
# Check Cloudinary credentials
# Verify image file size and format
# Check network connectivity
```

#### 4. Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

#### 5. Styling Issues

```bash
# Check Tailwind classes
# Verify tailwind.config.ts
# Check for CSS conflicts
```

### Debug Mode

Enable debug logging by adding to `.env.local`:

```bash
VITE_DEBUG=true
```

### Performance Issues

1. **Check bundle size**

   ```bash
   npm run build
   # Check dist/ folder size
   ```

2. **Profile components**

   - Use React DevTools Profiler
   - Check for unnecessary re-renders

3. **Optimize images**
   - Use appropriate image formats
   - Implement lazy loading
   - Optimize image sizes

## 📚 Additional Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

### Project-Specific

- `ARCHITECTURE.md` - Detailed architecture documentation
- `docs/db-design.md` - Database schema and relationships
- `docs/` - Additional project documentation

### Tools

- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Auto Rename Tag

## 🤝 Contributing Guidelines

### Before You Start

1. Read this guide thoroughly
2. Check existing issues and PRs
3. Ask questions in the project chat

### Code Review Process

1. All changes require review
2. Tests must pass
3. Code must follow project standards
4. Documentation must be updated

### Commit Messages

Use conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes

### Questions?

If you have questions or need help:

1. Check this guide first
2. Look at existing code for examples
3. Ask in the project chat
4. Create an issue if you find a bug

---

**Happy coding! 🚀**
