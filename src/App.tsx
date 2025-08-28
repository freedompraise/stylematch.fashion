import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { VendorDataProvider } from './services/vendorDataService';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore, initializeAuth, initializeVendor } from '@/stores';

function App() {
  const { user } = useAuthStore();
  
  useEffect(() => {
    // Initialize auth state
    const subscription = initializeAuth();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    // Initialize vendor state when user changes
    if (user) {
      initializeVendor(user);
    }
  }, [user]);

  return (
    <Router>
      <VendorDataProvider>
        <AppRoutes />
        <Toaster />
      </VendorDataProvider>
    </Router>
  );
}

export default App;
