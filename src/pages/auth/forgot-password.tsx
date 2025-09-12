import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { Mail } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import { AuthError } from '@/services/errors/AuthError';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SupportChat from '@/components/SupportChat';

const authService = new AuthService();

const forgotSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      setIsLoading(true);
      await authService.resetPassword(data.email);

      toast({
        title: 'Reset Link Sent',
        description: 'Please check your email for a link to reset your password.',
      });

      // Keep them on the same page but show success state
      form.reset();
    } catch (error) {
      console.error('Password reset request error:', error);
      
      const message = error instanceof AuthError
        ? error.message
        : 'Failed to send reset link. Please try again.';

      toast({
        title: 'Request Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-background rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-baseContent">
              Forgot Password?
            </h1>
            <p className="text-baseContent-secondary mt-2">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                Send Reset Link
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
    </div>
    <SupportChat isVendor={false} />
    </>
  );
};

export default ForgotPassword;
