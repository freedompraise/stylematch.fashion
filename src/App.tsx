import { BrowserRouter as Router } from 'react-router-dom';
import { VendorProvider } from '@/contexts/VendorContext';
import { VendorDataProvider } from './services/vendorDataService';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <VendorProvider>
        <VendorDataProvider>
          <AppRoutes />
          <Toaster />
        </VendorDataProvider>
      </VendorProvider>
    </Router>
  );
}

export default App;
