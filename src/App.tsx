import { BrowserRouter as Router } from 'react-router-dom';
import { VendorProvider } from '@/contexts/VendorContext';
import { VendorDataProvider } from './services/vendorDataService';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (    <Router>
      <VendorDataProvider>
        <VendorProvider>
          <AppRoutes />
          <Toaster />
        </VendorProvider>
      </VendorDataProvider>
    </Router>
  );
}

export default App;
