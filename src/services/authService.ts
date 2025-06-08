import supabase from '@/lib/supabaseClient';
import { AuthFormData } from '@/types';
import { toast } from '@/hooks/use-toast';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { VendorProfile } from '@/types/VendorSchema';

interface AuthResult {
  session: Session | null;
  shouldRedirectToOnboarding: boolean;
}

interface SessionInfo {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: User | null;
}

export class AuthService {
  // Private helper methods
  private handleAuthError(error: AuthError | Error | unknown) {
    let title = "Authentication Error";
    let message = error instanceof Error ? error.message : 'An unknown error occurred';

    // Handle specific Supabase auth errors
    if (error instanceof Error) {
      if (message.includes('Invalid login credentials')) {
        title = "Invalid Credentials";
        message = "The email or password you entered is incorrect.";
      } else if (message.includes('Email not confirmed')) {
        title = "Email Not Verified";
        message = "Please check your email and verify your account.";
      } else if (message.includes('Rate limit')) {
        title = "Too Many Attempts";
        message = "Please wait a moment before trying again.";
      }
    }

    toast({
      title: title,
      description: message,
      variant: "destructive",
    });
    throw error;
  }

  private handleAuthSuccess(message: string) {
    toast({
      title: "Success",
      description: message,
    });
  }

  // Public methods
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      this.handleAuthSuccess("Successfully signed in!");
      return {
        session: data.session,
        shouldRedirectToOnboarding: false
      };
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async signUp(formData: AuthFormData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            store_name: formData.store_name,
          },
        },
      });

      if (error) throw error;

      this.handleAuthSuccess("Account created successfully! Please check your email to verify your account.");
      return {
        session: data.session,
        shouldRedirectToOnboarding: true
      };
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async signInWithGoogle(redirectUrl: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      this.handleAuthSuccess("Redirecting to Google signin...");
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async handleOAuthCallback(hash: string): Promise<AuthResult | null> {
    try {
      // Parse hash parameters
      const hashParams = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (!accessToken) throw new Error('No access token found');

      // Set the session
      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) throw error;
      if (!session?.user) return null;
      
      this.handleAuthSuccess("Successfully signed in with Google!");
      
      return {
        session,
        shouldRedirectToOnboarding: false
      };
    } catch (error) {
      this.handleAuthError(error);
      return null;
    }
  }

  async handleAuthCallback(): Promise<AuthResult | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!session?.user) return null;
      
      return {
        session,
        shouldRedirectToOnboarding: false
      };
    } catch (error) {
      this.handleAuthError(error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.handleAuthSuccess("Successfully signed out!");
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async getCurrentSession(): Promise<SessionInfo> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return {
        accessToken: session?.access_token ?? null,
        refreshToken: session?.refresh_token ?? null,
        expiresAt: session?.expires_at ? session.expires_at * 1000 : null,
        user: session?.user ?? null
      };
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async refreshSession(): Promise<AuthResult> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      if (!session) throw new Error('Failed to refresh session');
      
      return {
        session,
        shouldRedirectToOnboarding: false
      };
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      
      if (error) throw error;
      
      this.handleAuthSuccess("Password reset instructions have been sent to your email!");
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      this.handleAuthSuccess("Password updated successfully!");
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  handleSessionExpiry() {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });
  }

  handleNetworkError() {
    toast({
      title: "Network Error",
      description: "Please check your internet connection and try again.",
      variant: "destructive",
    });
  }
}
