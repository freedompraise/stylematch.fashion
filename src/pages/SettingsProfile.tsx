import React, { useEffect, useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { VendorProfile } from '@/types/VendorSchema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SettingsProfile: React.FC = () => {
  const { session } = useSession();
  const { getVendorProfile, updateVendorProfile } = useVendorData();
  const { toast } = useToast();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    instagram_url: '',
    facebook_url: '',
    wabusiness_url: '',
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    getVendorProfile(session.user.id)
      .then((data) => {
        setProfile(data);
        setForm({
          name: data?.name || '',
          bio: data?.bio || '',
          instagram_url: data?.instagram_url || '',
          facebook_url: data?.facebook_url || '',
          wabusiness_url: data?.wabusiness_url || '',
        });
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id, getVendorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      await updateVendorProfile(session.user.id, form);
      toast({ title: 'Profile updated', description: 'Your profile has been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1">Name</label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Bio</label>
          <Textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Instagram URL</label>
          <Input name="instagram_url" value={form.instagram_url} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Facebook URL</label>
          <Input name="facebook_url" value={form.facebook_url} onChange={handleChange} />
        </div>
        <div>
          <label className="block font-semibold mb-1">WhatsApp Business URL</label>
          <Input name="wabusiness_url" value={form.wabusiness_url} onChange={handleChange} />
        </div>
        <Button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default SettingsProfile; 