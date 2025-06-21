import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { VendorProvider } from '@/contexts/VendorContext';
import { VendorDataProvider } from './services/vendorDataService';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <VendorProvider>
          <VendorDataProvider>
            <AppRoutes />
            <Toaster />
          </VendorDataProvider>
        </VendorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
