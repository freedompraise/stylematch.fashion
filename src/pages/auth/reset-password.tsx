import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/lib/toast';
import Logo from '@/components/Logo';
import { AuthError, AuthErrorType } from '@/services/errors/AuthError';
import SupportChat from '@/components/SupportChat';

const authService = new AuthService();

const resetSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const verifyResetToken = async () => {
      try {
        // Get the hash portion of the URL (contains the token)
        const hash = window.location.hash;
        if (!hash) {
          throw new AuthError(AuthErrorType.UNKNOWN, 'No reset token found');
        }

        // Verify the token
        const result = await authService.handleAuthCallback();
        if (!result?.session) {
          throw new AuthError(AuthErrorType.UNKNOWN, 'Invalid or expired reset token');
        }

        setIsValidToken(true);
      } catch (error) {
        console.error('Reset token verification error:', error);
        
        const message = error instanceof AuthError
          ? error.message
          : 'Password reset link is invalid or has expired. Please request a new one.';

        toast.error({
          title: 'Reset Link Invalid',
          description: message,
        });

        // Redirect to forgot password page
        navigate('/auth/forgot-password', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyResetToken();
  }, [navigate]);

  const onSubmit = async (data: ResetFormValues) => {
    try {
      setIsLoading(true);
      await authService.updatePassword(data.password);

      toast.success({
        title: 'Password Updated',
        description: 'Your password has been reset successfully. Please sign in with your new password.',
      });

      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Password reset error:', error);
      
      const message = error instanceof AuthError
        ? error.message
        : 'Failed to reset password. Please try again.';

      toast.error({
        title: 'Reset Failed',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <h1 className="text-xl font-semibold text-baseContent">
            Verifying Reset Link
          </h1>
          <p className="text-baseContent-secondary">
            Please wait while we verify your reset link...
          </p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // The useEffect will handle the redirect
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-card rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-baseContent">
              Reset Your Password
            </h1>
            <p className="text-baseContent-secondary mt-2">
              Please enter your new password
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground focus:outline-none"
                          onClick={() => setShowPassword(prev => !prev)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground focus:outline-none"
                          onClick={() => setShowConfirmPassword(prev => !prev)}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-baseContent-secondary">
              Remember your password?{" "}
              <button
                onClick={() => navigate('/auth')}
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      <SupportChat isVendor={false} />
    </div>
  );
}
