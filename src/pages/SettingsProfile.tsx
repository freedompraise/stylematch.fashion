import React, { useEffect } from 'react';
import { useVendor } from '@/contexts/VendorContext';
import { useVendorData } from '@/services/vendorDataService';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
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
  const { user, vendor, refreshVendor } = useVendor();
  const { updateVendorProfile } = useVendorData();

  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: vendor?.name || '',
      bio: vendor?.bio || '',
      instagram_url: vendor?.instagram_url || '',
      facebook_url: vendor?.facebook_url || '',
      wabusiness_url: vendor?.wabusiness_url || '',
    }
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name || '',
        bio: vendor.bio || '',
        instagram_url: vendor.instagram_url || '',
        facebook_url: vendor.facebook_url || '',
        wabusiness_url: vendor.wabusiness_url || '',
      });
    }
  }, [vendor, form]);
  const onSubmit = async (formData: ProfileFormData) => {
    if (!user?.id) return;
    try {
      // Prepare safe update object, sending null for empty optional fields
      const updateData = {
        name: formData.name,
        bio: formData.bio || null,
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        wabusiness_url: formData.wabusiness_url || null,
      };
      await updateVendorProfile(user.id, updateData);
      await refreshVendor(); // Refresh vendor data in context
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