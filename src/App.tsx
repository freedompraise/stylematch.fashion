import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import AppRoutes from '@/routes';
import { Toaster } from '@/components/ui/toaster';
import { initializeAuth } from '@/stores';

function App() {
  useEffect(() => {
    // Initialize auth state
    const subscription = initializeAuth();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <AppRoutes />
      <Toaster />
    </Router>
  );
}

export default App;
