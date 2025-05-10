// authService.ts
import supabase from '@/lib/supabaseClient';
import { VendorProfile } from '@/types/VendorSchema';

export type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string;
  store_name?: string;
  name?: string;
};

export class AuthService {

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  }

  async signUp(formData: AuthFormData) {
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
    return data;
  }

  async signInWithGoogle(redirectUrl: string) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) throw error;
  }

  async getVendorProfile(userId: string): Promise<VendorProfile | null> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as VendorProfile | null;
  }

  async createVendorProfile(userId: string, data: { store_name: string; name: string }) {
    const { error } = await supabase
      .from('vendors')
      .insert([
        {
          user_id: userId,
          store_name: data.store_name,
          name: data.name,
        },
      ]);

    if (error) throw error;
  }

  async handleAuthCallback() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session?.user) return null;

    const vendor = await this.getVendorProfile(session.user.id);
    
    return {
      session,
      vendor,
      shouldRedirectToOnboarding: !vendor,
    };
  }
}
