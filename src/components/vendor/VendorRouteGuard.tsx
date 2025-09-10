// src/components/vendor/VendorRouteGuard.tsx
import React, { useEffect, useState } from 'react';
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
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    // Only load vendor if we have a user and auth is not loading
    // Remove vendor from dependencies to prevent the effect from not running when vendor changes
    if (user?.id && !vendor && !loading && !authLoading && session && !hasAttemptedLoad) {
      setHasAttemptedLoad(true);
      loadVendorForRoute(user.id, route);
    }
  }, [user?.id, route, loading, authLoading, session, loadVendorForRoute, hasAttemptedLoad]);

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

  // Wait for vendor loading to complete before making routing decisions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading vendor profile...</span>
      </div>
    );
  }

  // Only redirect to onboarding if we've confirmed there's no vendor profile after loading
  // This prevents the race condition where we redirect before the async load completes
  if (session && user && !vendor && !error && !loading && hasAttemptedLoad) {
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

