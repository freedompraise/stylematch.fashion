import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AuthError, AuthErrorType } from '@/services/errors/AuthError';

export default function VerificationComplete() {
  const navigate = useNavigate();
  const { isVendorSignup } = useAuth();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const hash = window.location.hash;
        if (!hash) {
          throw new AuthError(AuthErrorType.UNKNOWN, 'No verification token found');
        }

        const result = await authService.handleOAuthCallback(hash);
        if (!result?.session) {
          throw new AuthError(AuthErrorType.UNKNOWN, 'Verification failed');
        }

        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully. Welcome to StyleMatch!',
        });

        if (isVendorSignup) {
          navigate('/vendor/onboarding', { replace: true });
        } else {
          navigate('/vendor/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Verification error:', error);
        
        const message = error instanceof AuthError
          ? error.message
          : 'Email verification failed. Please try signing in.';

        toast({
          title: 'Verification Failed',
          description: message,
          variant: 'destructive',
        });

        navigate('/auth', { replace: true });
      }
    };

    handleVerification();
  }, [navigate, isVendorSignup]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <h1 className="text-xl font-semibold text-baseContent">
          Completing Verification
        </h1>
        <p className="text-baseContent-secondary">
          Please wait while we verify your email...
        </p>
      </div>
    </div>
  );
}