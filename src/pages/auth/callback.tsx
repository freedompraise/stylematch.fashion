import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthService } from '@/services/authService';
import SupportChat from '@/components/SupportChat';

const authService = new AuthService();

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a hash in the URL (OAuth callback)
        const hash = window.location.hash;
        let result;

        if (hash) {
          result = await authService.handleOAuthCallback(hash);
        } else {
          result = await authService.handleAuthCallback();
        }

        if (!result?.session) {
          setError('Authentication failed');
          return;
        }

        // Successful login - let RequireVendor handle the routing
        navigate('/vendor/dashboard', { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-destructive">{error}</div>
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-baseContent-secondary">Completing authentication...</p>
      </div>
    </div>
    <SupportChat isVendor={false} />
    </>
  );
}