// src/components/vendor/VendorRouteGuard.tsx
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useVendorStore } from '@/stores/vendorStore';

interface VendorRouteGuardProps {
  children: React.ReactNode;
  route: string;
}

const VendorRouteGuard: React.FC<VendorRouteGuardProps> = ({ children, route }) => {
  const { user, session, isAuthenticated, loading: authLoading } = useAuthStore();
  const { vendor, loading, error, loadVendorForRoute } = useVendorStore();
  const location = useLocation();

  useEffect(() => {
    // Only load vendor if we have a user and auth is not loading
    if (user?.id && !vendor && !loading && !authLoading && session) {
      loadVendorForRoute(user.id, route);
    }
  }, [user?.id, route, vendor, loading, authLoading, session, loadVendorForRoute]);

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
  console.log('[VendorRouteGuard] State:', {
    authLoading,
    loading,
    isAuthenticated,
    hasUser: !!user?.id,
    hasSession: !!session,
    hasVendor: !!vendor,
    error: error?.message
  });

  // Only check authentication after auth loading is complete AND we have a definitive answer
  if (!authLoading && !session && !user) {
    console.log('[VendorRouteGuard] No session or user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show error if there's a real error (not just missing vendor)
  if (error && !error.message.includes('Failed to load vendor')) {
    console.error('[VendorRouteGuard] Vendor error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        <div className="text-red-500">Error loading vendor profile. Please try again.</div>
      </div>
    );
  }

  // Redirect to onboarding if no vendor profile exists (but user is authenticated)
  if (session && user && !vendor && !error && !loading) {
    console.log('[VendorRouteGuard] No vendor profile, redirecting to /vendor/onboarding');
    return <Navigate to="/vendor/onboarding" state={{ from: location }} replace />;
  }

  // If user is on onboarding page but already has a verified vendor profile, redirect to dashboard
  if (location.pathname.startsWith('/vendor/onboarding') && vendor && vendor.verification_status === 'verified') {
    const lastPath = localStorage.getItem('last_vendor_path');
    if (lastPath && lastPath !== '/vendor/onboarding') {
      console.log('[VendorRouteGuard] Verified vendor on onboarding, redirecting to:', lastPath);
      return <Navigate to={lastPath} replace />;
    } else {
      console.log('[VendorRouteGuard] Verified vendor on onboarding, redirecting to dashboard');
      return <Navigate to="/vendor/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default VendorRouteGuard;

