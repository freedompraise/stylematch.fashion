// routes.tsx

import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { useEffect, useState } from 'react';
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

const FullscreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-lg">
    <Loader2 className="animate-spin" size={24} />
    <span className="ml-2">Loading...</span>
  </div>
);

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useSession();

  if (session.loading) return <FullscreenLoader />;
  if (session.user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

type SessionGuardProps = {
  children: React.ReactNode;
  requireVendor?: boolean;
  redirectIfVendorExists?: boolean;
};

const SessionGuard = ({ children, requireVendor, redirectIfVendorExists }: SessionGuardProps) => {
  const { session } = useSession();
  const { getVendorProfile } = useVendorData();
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const validate = async () => {
      if (!session.user) {
        setRedirectTo('/auth');
        setChecking(false);
        return;
      }

      const vendor = await getVendorProfile(session.user.id);

      if (requireVendor && !vendor) {
        setRedirectTo('/onboarding');
      } else if (redirectIfVendorExists && vendor) {
        setRedirectTo('/dashboard');
      }

      setChecking(false);
    };

    validate();
  }, [session.user, getVendorProfile, requireVendor, redirectIfVendorExists]);

  if (session.loading || checking) return <FullscreenLoader />;
  if (redirectTo) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};

const VendorRoutes = () => (
  <VendorLayout>
    <Outlet />
  </VendorLayout>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/store/:name" element={<Storefront />} />

      <Route
        path="/onboarding"
        element={
          <SessionGuard redirectIfVendorExists>
            <VendorOnboarding />
          </SessionGuard>
        }
      />

      <Route
        element={
          <SessionGuard requireVendor>
            <VendorRoutes />
          </SessionGuard>
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
