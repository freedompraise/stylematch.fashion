// routes.tsx

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useVendorStore } from '@/stores/vendorStore';
import VendorRouteGuard from '@/components/vendor/VendorRouteGuard';

import Index from '@/pages/Index';
import Auth from '@/pages/auth/Index';
import AuthCallback from '@/pages/auth/callback';
import VerificationComplete from '@/pages/auth/verification-complete';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import VendorOnboarding from '@/pages/vendor/VendorOnboarding';
import VendorDashboard from '@/pages/vendor/VendorDashboard';
import ProductManagement from '@/pages/vendor/ProductManagement';
import OrderManagement from '@/pages/vendor/OrderManagement';
import NotFound from '@/pages/NotFound';
import VendorLayout from '@/components/vendor/VendorLayout';
import SettingsProfile from '@/pages/vendor/SettingsProfile';
import SettingsStore from '@/pages/vendor/SettingsStore';
import SettingsPayout from '@/pages/vendor/SettingsPayout';
import SettingsDangerZone from '@/pages/vendor/SettingsDangerZone';
import React, { lazy } from 'react';

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuthStore();

  // Debug logging
  console.log('[AuthRoute] State:', {
    loading,
    hasUser: !!user?.id,
    hasSession: !!session,
    pathname: window.location.pathname
  });

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg">
    <Loader2 className="animate-spin" size={24} />
    <span className="ml-2">Loading Auth...</span>
  </div>;
  
  // Only redirect if not loading and we have a session/user
  if (!loading && session && user) {
    console.log('[AuthRoute] User authenticated, redirecting to dashboard');
    return <Navigate to="/vendor/dashboard" replace />;
  }

  console.log('[AuthRoute] Showing auth page');
  return <>{children}</>;
};



// Lazy load buyer storefront pages
const Storefront = lazy(() => import('./pages/buyer/Storefront'));
const ProductDetail = lazy(() => import('./pages/buyer/ProductDetail'));
const StoreCheckout = lazy(() => import('./pages/buyer/StoreCheckout'));
const StoreConfirmation = lazy(() => import('./pages/buyer/StoreConfirmation'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/verification-complete" element={<VerificationComplete />} />
      <Route path="/auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      
      {/* Vendor onboarding route - requires auth but not vendor profile */}
      <Route
        path="/vendor/onboarding"
        element={
          <OnboardingRouteGuard>
            <VendorOnboarding />
          </OnboardingRouteGuard>
        }
      />

      {/* Vendor routes - requires both auth and vendor profile */}
      <Route path="/vendor/dashboard" element={
        <VendorRouteGuard route="dashboard">
          <VendorLayout>
            <VendorDashboard />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/products" element={
        <VendorRouteGuard route="products">
          <VendorLayout>
            <ProductManagement />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/products/:category" element={
        <VendorRouteGuard route="products">
          <VendorLayout>
            <ProductManagement />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/orders" element={
        <VendorRouteGuard route="orders">
          <VendorLayout>
            <OrderManagement />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/customers" element={
        <VendorRouteGuard route="customers">
          <VendorLayout>
            <div className="p-6">
              <h1 className="text-3xl font-bold">Customers</h1>
              <p className="mt-4">Customer management page coming soon.</p>
            </div>
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/payments" element={
        <VendorRouteGuard route="payments">
          <VendorLayout>
            <div className="p-6">
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="mt-4">Payment management page coming soon.</p>
            </div>
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/settings" element={
        <VendorRouteGuard route="settings">
          <VendorLayout>
            <SettingsProfile />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/settings/store" element={
        <VendorRouteGuard route="settings">
          <VendorLayout>
            <SettingsStore />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/settings/payout" element={
        <VendorRouteGuard route="settings">
          <VendorLayout>
            <SettingsPayout />
          </VendorLayout>
        </VendorRouteGuard>
      } />
      <Route path="/vendor/settings/danger" element={
        <VendorRouteGuard route="settings">
          <VendorLayout>
            <SettingsDangerZone />
          </VendorLayout>
        </VendorRouteGuard>
      } />

      {/* Buyer Storefront Public Routes */}
      <Route path="/store/:vendorSlug" element={<React.Suspense fallback={<div>Loading...</div>}><Storefront /></React.Suspense>} />
      <Route path="/store/:vendorSlug/product/:productId" element={<React.Suspense fallback={<div>Loading...</div>}><ProductDetail /></React.Suspense>} />
      <Route path="/store/:vendorSlug/checkout" element={<React.Suspense fallback={<div>Loading...</div>}><StoreCheckout /></React.Suspense>} />
      <Route path="/store/:vendorSlug/confirmation" element={<React.Suspense fallback={<div>Loading...</div>}><StoreConfirmation /></React.Suspense>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
// Onboarding route guard - requires auth but not vendor profile
const OnboardingRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading: authLoading } = useAuthStore();
  const { vendor, loading: vendorLoading } = useVendorStore();

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Initializing...</span>
      </div>
    );
  }

  // Debug logging
  console.log('[OnboardingRouteGuard] State:', {
    authLoading,
    vendorLoading,
    hasUser: !!user?.id,
    hasSession: !!session,
    hasVendor: !!vendor
  });

  // Redirect to auth if not authenticated
  if (!authLoading && !session && !user) {
    console.log('[OnboardingRouteGuard] Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // If user already has a verified vendor profile, redirect to dashboard
  if (vendor && vendor.verification_status === 'verified') {
    console.log('[OnboardingRouteGuard] User already verified, redirecting to dashboard');
    return <Navigate to="/vendor/dashboard" replace />;
  }

  console.log('[OnboardingRouteGuard] Auth check passed, showing onboarding');
  return <>{children}</>;
};

