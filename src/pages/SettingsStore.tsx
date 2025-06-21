import React, { useEffect, useState } from 'react';
import { useVendor } from '@/contexts/VendorContext';
import type { VendorProfile } from '@/types/VendorSchema';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { FormActions } from '@/components/ui/form-actions';
import { Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreImageUpload } from '@/components/vendor/StoreImageUpload';

type StoreFormData = {
  store_name: string;
};

const SettingsStore: React.FC = () => {
  const { vendor, updateVendorProfile } = useVendor();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<StoreFormData>({
    defaultValues: {
      store_name: vendor?.store_name || '',
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        store_name: vendor.store_name || '',
      });
      if (vendor.banner_image_url) {
        setPreviewUrl(vendor.banner_image_url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [vendor, form]);

  const onSubmit = async (formData: StoreFormData) => {
    try {
      const updates: Partial<typeof vendor> = { store_name: formData.store_name };
      // If there's no preview URL, it means the user removed the image.
      if (previewUrl === null && vendor?.banner_image_url) {
        updates.banner_image_url = null;
      }
      
      await updateVendorProfile(updates, imageFile || undefined);
      
      setImageFile(null); // Clear the file input after submission
      toast({ title: 'Store updated', description: 'Your store settings have been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update store.', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    form.reset({ store_name: vendor?.store_name || '' });
    setImageFile(null);
    setPreviewUrl(vendor?.banner_image_url || null);
  };

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
                  const link = `https://www.stylematch.fashion/store/${storeName}`;
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
            <StoreImageUpload
              imageFile={imageFile}
              onImageFileChange={setImageFile}
              previewUrl={previewUrl}
              onPreviewUrlChange={setPreviewUrl}
              existingImageUrl={vendor?.banner_image_url}
            />
          </div>
          <FormActions
            onCancel={handleCancel}
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
