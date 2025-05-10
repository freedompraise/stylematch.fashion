import { BrowserRouter as Router } from 'react-router-dom';
import { SessionProvider } from '@/contexts/SessionContext';
import { VendorDataProvider } from './services/vendorDataService';
import AppRoutes from '@/routes';
import { ToastProvider, ToastViewport } from "@/components/ui/toast"

function App() {
  return (
    <Router>
      <SessionProvider>
      <VendorDataProvider>
        <ToastProvider>
        <AppRoutes />
         <ToastViewport />
        </ToastProvider>
        </VendorDataProvider>
      </SessionProvider>
    </Router>
  );
}

export default App;
