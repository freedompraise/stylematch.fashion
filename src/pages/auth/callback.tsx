import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { supabase } = useSession();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          // Check if vendor profile exists
          const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (vendorError && vendorError.code !== 'PGRST116') {
            throw vendorError;
          }

          if (!vendor) {
            // Create vendor profile for OAuth users
            const { error: createError } = await supabase
              .from('vendors')
              .insert([
                {
                  user_id: session.user.id,
                  store_name: session.user.user_metadata.store_name || 'My Store',
                  name: session.user.user_metadata.full_name || session.user.email?.split('@')[0],
                },
              ]);

            if (createError) throw createError;
            navigate('/onboarding');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}