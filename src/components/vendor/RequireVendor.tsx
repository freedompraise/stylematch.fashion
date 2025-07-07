// RequireVendor.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVendor } from '@/contexts/VendorContext';

const RequireVendor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { vendor, loading: vendorLoading, ready } = useVendor();
  const location = useLocation();

  const isOnboardingPage = location.pathname.startsWith('/vendor/onboarding');
  const isVendorRoute = location.pathname.startsWith('/vendor/') && !isOnboardingPage;

  // Always store last vendor path on vendor route (except onboarding)
  React.useEffect(() => {
    if (isVendorRoute) {
      localStorage.setItem('last_vendor_path', location.pathname);
    }
  }, [location.pathname, isVendorRoute]);

  if (authLoading || vendorLoading || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[RequireVendor] Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Only redirect to onboarding if ready is true and vendor is null
  if (ready && !vendor) {
    console.log('[RequireVendor] No vendor, redirecting to /vendor/onboarding');
    return <Navigate to="/vendor/onboarding" state={{ from: location }} replace />;
  }

  if (isOnboardingPage && vendor && vendor.verification_status === 'verified') {
    const lastPath = localStorage.getItem('last_vendor_path');
    if (lastPath && lastPath !== '/vendor/onboarding') {
      console.log('[RequireVendor] Verified vendor on onboarding, restoring last path:', lastPath);
      return <Navigate to={lastPath} replace />;
    }
    console.log('[RequireVendor] Verified vendor on onboarding, redirecting to dashboard');
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireVendor;
