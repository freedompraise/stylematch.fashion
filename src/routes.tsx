// routes.tsx

import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import RequireVendor from '@/components/vendor/RequireVendor';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/auth/callback';
import VerificationComplete from '@/pages/auth/verification-complete';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import VendorOnboarding from '@/pages/VendorOnboarding';
import VendorDashboard from '@/pages/VendorDashboard';
import ProductManagement from '@/pages/ProductManagement';
import OrderManagement from '@/pages/OrderManagement';
import NotFound from '@/pages/NotFound';
import VendorLayout from '@/components/vendor/VendorLayout';
import SettingsProfile from '@/pages/SettingsProfile';
import SettingsStore from '@/pages/SettingsStore';
import SettingsPayout from '@/pages/SettingsPayout';
import SettingsDangerZone from '@/pages/SettingsDangerZone';
import React, { lazy } from 'react';

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen text-lg">
    <Loader2 className="animate-spin" size={24} />
    <span className="ml-2">Loading Auth...</span>
  </div>;
  
  if (isAuthenticated) {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return <>{children}</>;
};

const VendorRoutes = () => (
  <VendorLayout>
    <Outlet />
  </VendorLayout>
);

// Lazy load buyer storefront pages
const Storefront = lazy(() => import('./pages/Storefront'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const StoreCheckout = lazy(() => import('./pages/StoreCheckout'));
const StoreConfirmation = lazy(() => import('./pages/StoreConfirmation'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/verification-complete" element={<VerificationComplete />} />
      <Route path="/auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      <Route path="/store/:name" element={<React.Suspense fallback={<div>Loading...</div>}><Storefront /></React.Suspense>} />
      
      {/* Vendor onboarding route - requires auth but not vendor profile */}
      <Route
        path="/vendor/onboarding"
        element={
          <RequireAuth>
            <VendorOnboarding />
          </RequireAuth>
        }
      />

      {/* Vendor routes - requires both auth and vendor profile */}
      <Route
        element={
          <RequireVendor>
            <VendorRoutes />
          </RequireVendor>
        }
      >
        <Route path="vendor/dashboard" element={<VendorDashboard />} />
        <Route path="vendor/products" element={<ProductManagement />} />
        <Route path="vendor/products/:category" element={<ProductManagement />} />
        <Route path="vendor/orders" element={<OrderManagement />} />
        <Route 
          path="customers" 
          element={
            <div className="p-6">
              <h1 className="text-3xl font-bold">Customers</h1>
              <p className="mt-4">Customer management page coming soon.</p>
            </div>
          } 
        />
        <Route 
          path="payments" 
          element={
            <div className="p-6">
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="mt-4">Payment management page coming soon.</p>
            </div>
          } 
        />
        <Route path="vendor/settings">
          <Route index element={<SettingsProfile />} />
          <Route path="store" element={<SettingsStore />} />
          <Route path="payout" element={<SettingsPayout />} />
          <Route path="danger" element={<SettingsDangerZone />} />
        </Route>
      </Route>

      {/* Buyer Storefront Public Routes */}
      <Route path="/store/:vendorSlug" element={<React.Suspense fallback={<div>Loading...</div>}><Storefront /></React.Suspense>} />
      <Route path="/store/:vendorSlug/product/:productId" element={<React.Suspense fallback={<div>Loading...</div>}><ProductDetail /></React.Suspense>} />
      <Route path="/store/:vendorSlug/checkout" element={<React.Suspense fallback={<div>Loading...</div>}><StoreCheckout /></React.Suspense>} />
      <Route path="/store/:vendorSlug/confirmation" element={<React.Suspense fallback={<div>Loading...</div>}><StoreConfirmation /></React.Suspense>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// New auth guard component
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">
      <Loader2 className="animate-spin" size={24} />
      <span className="ml-2">Loading Auth...</span>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
