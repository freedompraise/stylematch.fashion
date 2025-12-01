import React, { useEffect, useState } from 'react';
import { useVendorStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clipboard } from 'lucide-react';
import { StoreImageUpload } from '@/components/vendor/StoreImageUpload';
import { validateStoreNameForSlug } from '@/lib/utils';
import { toast } from '@/lib/toast';

type StoreFormData = {
  store_name: string;
};

export function SettingsStore() {
  const { vendor, updateVendorProfile } = useVendorStore();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    store_name: vendor?.store_name || '',
    bio: vendor?.bio || '',
    instagram_url: vendor?.instagram_url || '',
    facebook_url: vendor?.facebook_url || '',
    wabusiness_url: vendor?.wabusiness_url || '',
  });
  
  const [storeNameError, setStoreNameError] = useState<string | null>(null);

  useEffect(() => {
    if (vendor) {
      setFormData({
        store_name: vendor.store_name || '',
        bio: vendor.bio || '',
        instagram_url: vendor.instagram_url || '',
        facebook_url: vendor.facebook_url || '',
        wabusiness_url: vendor.wabusiness_url || '',
      });
      if (vendor.banner_image_url) {
        setPreviewUrl(vendor.banner_image_url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [vendor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: Partial<typeof vendor> = {
        store_name: formData.store_name,
        bio: formData.bio,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        wabusiness_url: formData.wabusiness_url,
      };
      if (previewUrl === null && vendor?.banner_image_url) {
        updates.banner_image_url = null;
      }
      await updateVendorProfile(updates, imageFile || undefined);
      toast.store.updateSuccess();
    } catch (error) {
      toast.store.updateError();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'store_name') {
      const validation = validateStoreNameForSlug(value);
      setStoreNameError(validation.isValid ? null : validation.error);
    }
  };

  const handleCancel = () => {
    setFormData({
      store_name: vendor?.store_name || '',
      bio: vendor?.bio || '',
      instagram_url: vendor?.instagram_url || '',
      facebook_url: vendor?.facebook_url || '',
      wabusiness_url: vendor?.wabusiness_url || '',
    });
    setImageFile(null);
    setPreviewUrl(vendor?.banner_image_url || null);
    setStoreNameError(null);
  };

  const handleCopyLink = () => {
    if (vendor?.store_slug) {
      const link = `${window.location.origin}/store/${vendor.store_slug}`;
      navigator.clipboard.writeText(link);
      toast.general.linkCopied();
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Store Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            Update your store name, description, and social media links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="store_name"
                  value={formData.store_name}
                  onChange={(e) => handleInputChange('store_name', e.target.value)}
                  placeholder="Enter your store name"
                  className={storeNameError ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleCopyLink}
                  disabled={!vendor?.store_slug}
                >
                  <Clipboard className="w-4 h-4" />
                  Copy Link
                </Button>
              </div>
              {storeNameError && (
                <p className="text-sm text-red-500">{storeNameError}</p>
              )}
              {vendor?.store_slug && (
                <div className="text-sm text-muted-foreground">
                  Current store URL: <code className="bg-muted px-1 py-0.5 rounded">stylematch.live/store/{vendor.store_slug}</code>
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Quick access:</strong> You can also view and copy your store link from the header at the top of any page in your dashboard.
                    </p>
                  </div>
                  {formData.store_name !== vendor.store_name && !storeNameError && (
                    <span className="block mt-1 text-amber-600">
                      ⚠️ Changing store name will update your store URL
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Store Description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Describe your store and what you sell"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                type="url"
                value={formData.instagram_url}
                onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourstore"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                type="url"
                value={formData.facebook_url}
                onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourstore"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wabusiness_url">WhatsApp Business URL</Label>
              <Input
                id="wabusiness_url"
                type="url"
                value={formData.wabusiness_url}
                onChange={(e) => handleInputChange('wabusiness_url', e.target.value)}
                placeholder="https://wa.me/yournumber"
              />
            </div>

            <div>
              <Label htmlFor="banner_image">Banner Image</Label>
              <StoreImageUpload
                imageFile={imageFile}
                onImageFileChange={setImageFile}
                previewUrl={previewUrl}
                onPreviewUrlChange={setPreviewUrl}
                existingImageUrl={vendor?.banner_image_url}
              />
            </div>

            <Button type="submit" disabled={loading || !!storeNameError}>
              {loading ? 'Updating...' : 'Update Store Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsStore;
