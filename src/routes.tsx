import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import SettingsProfile from '@/pages/SettingsProfile';
import SettingsStore from '@/pages/SettingsStore';
import SettingsPayout from '@/pages/SettingsPayout';
import SettingsDangerZone from '@/pages/SettingsDangerZone';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const VendorRoutes = () => {
  return (
    <VendorLayout>
      <Outlet />
    </VendorLayout>
  );
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/store/:id" element={<Storefront />} />

      {/* Protected vendor routes */}
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
        element={
          <ProtectedRoute>
            <VendorRoutes />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="products/:category" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
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
        <Route path="settings">
          <Route index element={<SettingsProfile />} />
          <Route path="store" element={<SettingsStore />} />
          <Route path="payout" element={<SettingsPayout />} />
          <Route path="danger" element={<SettingsDangerZone />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
