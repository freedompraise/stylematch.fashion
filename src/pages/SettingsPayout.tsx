import React, { useEffect, useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { VendorProfile } from '@/types/VendorSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SettingsPayout: React.FC = () => {
  const { session } = useSession();
  const { getVendorProfile, updateVendorProfile } = useVendorData();
  const { toast } = useToast();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bank_name: '',
    account_number: '',
    account_name: '',
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    getVendorProfile(session.user.id)
      .then((data) => {
        setProfile(data);
        setForm({
          bank_name: data?.payout_info?.bank_name || '',
          account_number: data?.payout_info?.account_number || '',
          account_name: data?.payout_info?.account_name || '',
        });
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id, getVendorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      await updateVendorProfile(session.user.id, { payout_info: form });
      toast({ title: 'Payout info updated', description: 'Your payout information has been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update payout info.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payout Configuration</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1">Payment Mode</label>
          <Input value="Paystack" disabled className="bg-muted" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Bank Name</label>
          <Input name="bank_name" value={form.bank_name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Account Number</label>
          <Input name="account_number" value={form.account_number} onChange={handleChange} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Account Name</label>
          <Input name="account_name" value={form.account_name} onChange={handleChange} required />
        </div>
        <Button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default SettingsPayout; 