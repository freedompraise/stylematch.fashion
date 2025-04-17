import { BrowserRouter as Router } from 'react-router-dom';
import { SessionProvider } from '@/contexts/SessionContext';
import { Toaster } from 'sonner';
import AppRoutes from '@/routes';

function App() {
  return (
    <Router>
      <SessionProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </SessionProvider>
    </Router>
  );
}

export default App;
