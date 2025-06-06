import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const authService = new AuthService();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment and URL params
        const hash = window.location.hash;
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        
        // Check for OAuth errors first
        if (error || errorDescription) {
          throw new Error(errorDescription || error || 'Authentication failed');
        }

        // Handle the OAuth callback with hash params
        if (hash) {
          const result = await authService.handleOAuthCallback(hash);
          if (!result?.session?.user) {
            throw new Error('No user session found after OAuth callback');
          }

          toast({
            title: "Success",
            description: "Successfully signed in!"
          });

          // Navigate based on vendor profile
          if (result.shouldRedirectToOnboarding) {
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
          return;
        }

        throw new Error('No authentication data found');

      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : "Failed to authenticate",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };

    // Execute the callback handler
    handleCallback();
  }, [navigate, authService, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}