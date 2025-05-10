import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';

export default function AuthCallback() {
  const navigate = useNavigate();
  const authService = new AuthService();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await authService.handleAuthCallback();
        if (!result || !result.session?.user) {
          throw new Error('No session found');
        }
        if (result.shouldRedirectToOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=callback_failed');
      }
    };
    handleCallback();
  }, [navigate, authService]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}