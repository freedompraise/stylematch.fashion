import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';
import { useLocation } from 'react-router-dom';

interface RequireVendorProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const FullscreenLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-lg">
    <div className="flex items-center justify-center mb-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
    <div className="text-baseContent-secondary">Loading your store...</div>
  </div>
);

export function RequireVendor({ 
  children, 
  redirectTo = '/auth'
}: RequireVendorProps) {
  const { isAuthenticated, isOnboarded, loading, vendor, user } = useVendor();
  const location = useLocation();

  // Debug logging for component state
  console.debug('RequireVendor Debug:', {
    path: location.pathname,
    isAuthenticated,
    isOnboarded,
    loading,
    hasUser: !!user,
    hasVendor: !!vendor,
    vendorData: vendor,
    timestamp: new Date().toISOString()
  });

  // Show loading state during initial authentication check
  if (loading) {
    console.debug('RequireVendor: Loading vendor state...');
    return <FullscreenLoader />;
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated || !user) {
    console.debug('RequireVendor: User not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Special handling for onboarding route
  if (location.pathname === '/onboarding') {
    // Redirect to dashboard if already onboarded
    if (isOnboarded) {
      console.debug('RequireVendor: Already onboarded, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    console.debug('RequireVendor: Allowing access to onboarding page');
    return <>{children}</>;
  }

  // For all other protected routes
  if (!isOnboarded && location.pathname !== '/onboarding') {
    console.debug('RequireVendor: Not onboarded, redirecting to onboarding');
    return <Navigate to="/onboarding" state={{ from: location.pathname }} replace />;
  }

  // Allow access to route if all conditions are met
  console.debug('RequireVendor: All conditions met, rendering protected content');
  return <>{children}</>;
}

export default RequireVendor;
