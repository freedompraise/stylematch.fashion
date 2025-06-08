import React, { useEffect, useState } from 'react';
import { useVendor } from '@/contexts/VendorContext';
import { useVendorData } from '@/services/vendorDataService';
import type { VendorProfile } from '@/types/VendorSchema';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { FormActions } from '@/components/ui/form-actions';
import CloudinaryImage from '@/components/CloudinaryImage';
import { Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StoreFormData = {
  store_name: string;
  banner_image_url: string | null;
}

const SettingsStore: React.FC = () => {
  const { user, vendor, refreshVendor } = useVendor();
  const { updateVendorProfile } = useVendorData();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<StoreFormData>({
    defaultValues: {
      store_name: vendor?.store_name || '',
      banner_image_url: vendor?.banner_image_url || null,
    }
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        store_name: vendor.store_name || '',
        banner_image_url: vendor.banner_image_url || null,
      });
    }
  }, [vendor, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  const onSubmit = async (formData: StoreFormData) => {
    if (!user?.id) return;
    try {
      await updateVendorProfile(session.user.id, { store_name: formData.store_name }, imageFile);
      toast({ title: 'Store updated', description: 'Your store settings have been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update store.', variant: 'destructive' });
    }
  };

  const bannerImageUrl = form.watch('banner_image_url');

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Store Settings</h1>
      <FormProvider {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="block font-semibold mb-1">Store Name</label>
            <div className="flex items-center gap-2">
              <Input {...form.register('store_name', { required: true })} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  const storeName = form.getValues('store_name');
                  if (!storeName) return;
                  const link = `https://stylematch.fashion/store/${storeName}`;
                  navigator.clipboard.writeText(link);
                  toast({ title: 'Link copied', description: 'Store link copied to clipboard.' });
                }}
                disabled={!form.watch('store_name')}
              >
                <Clipboard className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Banner Image</label>
            {bannerImageUrl && (
              <div className="mb-2">
                <CloudinaryImage
                  publicId={bannerImageUrl}
                  alt="Store Banner"
                  width={400}
                  height={120}
                  className="rounded-md"
                />
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <FormActions
            onCancel={() => {
              form.reset();
              setImageFile(null);
            }}
            isSubmitting={form.formState.isSubmitting}
            submitText="Save Changes"
            submittingText="Saving..."
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default SettingsStore;