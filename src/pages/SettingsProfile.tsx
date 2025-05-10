import React, { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { FormActions } from '@/components/ui/form-actions';

interface ProfileFormData {
  name: string;
  bio: string;
  instagram_url: string;
  facebook_url: string;
  wabusiness_url: string;
}

const SettingsProfile: React.FC = () => {
  const { session } = useSession();
  const { getVendorProfile, updateVendorProfile } = useVendorData();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      bio: '',
      instagram_url: '',
      facebook_url: '',
      wabusiness_url: '',
    }
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    getVendorProfile(session.user.id)
      .then((data) => {
        if (data) {
          form.reset({
            name: data.name || '',
            bio: data.bio || '',
            instagram_url: data.instagram_url || '',
            facebook_url: data.facebook_url || '',
            wabusiness_url: data.wabusiness_url || '',
          });
        }
      });
  }, [session?.user?.id, getVendorProfile, form]);

  const onSubmit = async (formData: ProfileFormData) => {
    if (!session?.user?.id) return;
    try {
      // Prepare safe update object, sending null for empty optional fields
      const updateData = {
        name: formData.name,
        bio: formData.bio || null,
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        wabusiness_url: formData.wabusiness_url || null,
      };
      await updateVendorProfile(session.user.id, updateData);
      toast({ title: 'Profile updated', description: 'Your profile has been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <FormProvider {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <Input {...form.register('name', { required: true })} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bio</label>
            <Textarea {...form.register('bio')} rows={3} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Instagram URL</label>
            <Input {...form.register('instagram_url')} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Facebook URL</label>
            <Input {...form.register('facebook_url')} />
          </div>
          <div>
            <label className="block font-semibold mb-1">WhatsApp Business URL</label>
            <Input {...form.register('wabusiness_url')} />
          </div>
          <FormActions
            onCancel={() => form.reset()}
            isSubmitting={form.formState.isSubmitting}
            submitText="Save Changes"
            submittingText="Saving..."
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default SettingsProfile;