
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/auth/callback';
import VendorOnboarding from '@/pages/VendorOnboarding';
import VendorDashboard from '@/pages/VendorDashboard';
import ProductManagement from '@/pages/ProductManagement';
import OrderManagement from '@/pages/OrderManagement';
import Storefront from '@/pages/Storefront';
import NotFound from '@/pages/NotFound';
import VendorLayout from '@/components/layouts/VendorLayout';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Vendor layout wrapper
const VendorRoute = ({ children }: { children: React.ReactNode }) => {
  return <VendorLayout>{children}</VendorLayout>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/store/:id" element={<Storefront />} />

      {/* Protected routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <VendorOnboarding />
          </ProtectedRoute>
        }
      />
      
      {/* Vendor routes with layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <VendorDashboard />
            </VendorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <ProductManagement />
            </VendorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:category"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <ProductManagement />
            </VendorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <OrderManagement />
            </VendorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Customers</h1>
                <p className="mt-4">Customer management page coming soon.</p>
              </div>
            </VendorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Payments</h1>
                <p className="mt-4">Payment management page coming soon.</p>
              </div>
            </VendorRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <VendorRoute>
              <div className="p-6">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="mt-4">Settings page coming soon.</p>
              </div>
            </VendorRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
