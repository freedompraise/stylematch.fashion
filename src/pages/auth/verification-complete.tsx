import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { useVendor } from '@/contexts/VendorContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AuthError, AuthErrorType } from '@/services/errors/AuthError';

const authService = new AuthService();

export default function VerificationComplete() {
  const navigate = useNavigate();
  const { refreshVendor } = useVendor();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get the hash portion of the URL (contains the tokens)
        const hash = window.location.hash;
        if (!hash) {
          throw new AuthError(AuthErrorType.UNKNOWN, 'No verification token found');
        }

        // Handle the auth callback and get session
        const result = await authService.handleOAuthCallback(hash);
        if (!result?.session) {
          throw new AuthError(AuthErrorType.UNKNOWN, 'Verification failed');
        }

        // Refresh vendor data
        await refreshVendor();

        // Show success message
        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully. Welcome to StyleMatch!',
        });

        // Redirect based on whether they need onboarding
        if (result.shouldRedirectToOnboarding) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
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

        // Redirect back to login
        navigate('/auth', { replace: true });
      }
    };

    handleVerification();
  }, [navigate, refreshVendor]);

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