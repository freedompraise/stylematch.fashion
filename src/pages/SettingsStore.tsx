import React, { useEffect, useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { VendorProfile } from '@/types/VendorSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CloudinaryImage from '@/components/CloudinaryImage';

const SettingsStore: React.FC = () => {
  const { session } = useSession();
  const { getVendorProfile, updateVendorProfile } = useVendorData();
  const { toast } = useToast();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    store_name: '',
    banner_image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    getVendorProfile(session.user.id)
      .then((data) => {
        setProfile(data);
        setForm({
          store_name: data?.store_name || '',
          banner_image_url: data?.banner_image_url || '',
        });
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id, getVendorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      await updateVendorProfile(session.user.id, { store_name: form.store_name }, imageFile || undefined);
      toast({ title: 'Store updated', description: 'Your store profile has been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update store.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Store Profile</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1">Store Name</label>
          <Input name="store_name" value={form.store_name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Banner Image</label>
          {form.banner_image_url && (
            <div className="mb-2">
              <CloudinaryImage publicId={form.banner_image_url} alt="Store Banner" width={400} height={120} className="rounded-md" />
            </div>
          )}
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <Button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default SettingsStore; 