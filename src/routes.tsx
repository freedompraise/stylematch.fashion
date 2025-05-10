// routes.tsx
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useContext, useEffect, useState } from 'react';
import { useVendorData } from './services/vendorDataService';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/auth/callback';
import { Loader2 } from 'lucide-react';
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

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();


  if (session.loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">
      <Loader2 className="animate-spin" size={24} />
      <span className="ml-2">Loading...</span>
    </div>;
  }

  if (session.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();
  const { getVendorProfile } = useVendorData();
  const [checkingVendor, setCheckingVendor] = useState(true);
  const [redirectToOnboarding, setRedirectToOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkVendor = async () => {
      if (session.user) {
        try {
          const vendor = await getVendorProfile(session.user.id);
          if (!vendor) {
            setRedirectToOnboarding(true);
          } else {
            setRedirectToOnboarding(false);
          }
        } catch (error) {
          console.error('Error checking vendor profile:', error);
        }
      }
      setCheckingVendor(false);
    };
    checkVendor();
  }, [session.user, getVendorProfile]);

  if (session.loading || checkingVendor) {
    return <div className="flex items-center justify-center min-h-screen text-lg">
      <Loader2 className="animate-spin" size={24} />
      <span className="ml-2">Loading...</span>
    </div>;
  }

  if (!session.user) {
    return <Navigate to="/auth" replace />;
  }

  if (redirectToOnboarding) {
    return <Navigate to="/onboarding" replace />;
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
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/store/:id" element={<Storefront />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <VendorOnboarding />
          </ProtectedRoute>
        }
      />

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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
