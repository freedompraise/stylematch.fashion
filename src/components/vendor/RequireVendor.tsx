import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVendor } from '@/contexts/VendorContext';

const RequireVendor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { vendor, loading: vendorLoading } = useVendor();
  const location = useLocation();

  // Show loading state while checking auth and vendor status
  if (authLoading || vendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If no vendor profile exists, redirect to onboarding
  if (!vendor) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default RequireVendor;
