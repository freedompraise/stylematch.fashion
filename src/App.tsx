import { BrowserRouter as Router } from 'react-router-dom';
import { SessionProvider } from '@/contexts/SessionContext';
import { VendorDataProvider } from './services/vendorDataService';
import { Toaster } from 'sonner';
import AppRoutes from '@/routes';

function App() {
  return (
    <Router>
      <SessionProvider>
      <VendorDataProvider>
        <AppRoutes />
        <Toaster position="top-right" />
        </VendorDataProvider>
      </SessionProvider>
    </Router>
  );
}

export default App;
