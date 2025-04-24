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

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderManagement />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 