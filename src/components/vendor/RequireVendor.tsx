import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';

interface RequireVendorProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

const FullscreenLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-lg">
    <Loader2 className="animate-spin" size={24} />
    <span className="ml-2">Loading...</span>
  </div>
);

export function RequireVendor({ 
  children, 
  requireOnboarding = true,
  redirectTo = '/auth'
}: RequireVendorProps) {
  const { isAuthenticated, isOnboarded, loading } = useVendor();

  if (loading) {
    return <FullscreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireOnboarding && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export default RequireVendor;
