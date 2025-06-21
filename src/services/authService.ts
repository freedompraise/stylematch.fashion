import supabase from '@/lib/supabaseClient';
import { AuthFormData } from '@/types';
import { Session, User } from '@supabase/supabase-js';
import { AuthError, AuthErrorType } from './errors/AuthError';

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

export interface AuthState {
  user: User | null;
  session: Session | null;
}

export class AuthService {
  // Private helper methods
  private formatAuthError(error: Error | unknown): AuthError {
    let type = AuthErrorType.UNKNOWN;
    let message = error instanceof Error ? error.message : 'An unknown error occurred';

    if (error instanceof Error) {
      if (message.includes('Invalid login credentials')) {
        type = AuthErrorType.INVALID_CREDENTIALS;
        message = "The email or password you entered is incorrect.";
      } else if (message.includes('Email not confirmed')) {
        type = AuthErrorType.EMAIL_NOT_VERIFIED;
        message = "Please check your email and verify your account.";
      } else if (message.includes('Rate limit')) {
        type = AuthErrorType.RATE_LIMIT;
        message = "Please wait a moment before trying again.";
      } else if (message.includes('network')) {
        type = AuthErrorType.NETWORK_ERROR;
        message = "Please check your internet connection and try again.";
      } else if (message.includes('expired')) {
        type = AuthErrorType.SESSION_EXPIRED;
        message = "Your session has expired. Please sign in again.";
      }
    }

    return new AuthError(type, message);
  }

  private shouldRedirectToOnboarding(session: Session | null): boolean {
    if (!session?.user) return false;
    
    // Check if this is a new signup
    const signupType = session.user.app_metadata?.signup_type;
    if (signupType === 'email' && !session.user.user_metadata?.isOnboarded) {
      return true;
    }
    
    // For OAuth logins, check if they've completed onboarding
    if (signupType === 'oauth' && !session.user.user_metadata?.isOnboarded) {
      return true;
    }

    return false;
  }

  // Public methods
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  async signUp(formData: AuthFormData): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verification-complete`,
        }
      });

      if (error) throw this.formatAuthError(error);

      return {
        session: data.session,
        shouldRedirectToOnboarding: true
      };
    } catch (error) {
      throw this.formatAuthError(error);
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
    } catch (error) {
      throw this.formatAuthError(error);
    }
  }

  async handleOAuthCallback(hash: string): Promise<AuthResult | null> {
    try {
      const hashParams = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (!accessToken) throw this.formatAuthError(new Error('No access token found'));

      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) throw this.formatAuthError(error);
      if (!session?.user) return null;
      
      return {
        session,
        shouldRedirectToOnboarding: this.shouldRedirectToOnboarding(session)
      };
    } catch (error) {
      throw this.formatAuthError(error);
    }
  }

  async handleAuthCallback(): Promise<AuthResult | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw this.formatAuthError(error);
      if (!session?.user) return null;
      
      return {
        session,
        shouldRedirectToOnboarding: this.shouldRedirectToOnboarding(session)
      };
    } catch (error) {
      throw this.formatAuthError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      
      if (error) throw error;
    } catch (error) {
      throw this.formatAuthError(error);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
    } catch (error) {
      throw this.formatAuthError(error);
    }
  }
}

export const authService = new AuthService();
