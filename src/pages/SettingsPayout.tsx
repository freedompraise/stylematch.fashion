import React, { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { FormActions } from '@/components/ui/form-actions';
import { Form } from '@/components/ui/form';

interface PayoutFormData {
  bank_name: string;
  account_number: string;
  account_name: string;
}

const initialFormData: PayoutFormData = {
  bank_name: '',
  account_number: '',
  account_name: '',
};

const SettingsPayout: React.FC = () => {
  const { session } = useSession();
  const { getVendorProfile, updateVendorProfile } = useVendorData();
  const { toast } = useToast();

  const form = useForm<PayoutFormData>({
    defaultValues: initialFormData
  });

  useEffect(() => {
    if (!session?.user?.id) return;
    getVendorProfile(session.user.id)
      .then((data) => {
        if (data?.payout_info) {
          const formData: PayoutFormData = {
            bank_name: data.payout_info.bank_name || '',
            account_number: data.payout_info.account_number || '',
            account_name: data.payout_info.account_name || '',
          };
          form.reset(formData);
        }
      });
  }, [session?.user?.id, getVendorProfile, form]);

  const handleSubmit = form.handleSubmit(async (values: PayoutFormData) => {
    if (!session?.user?.id) return;
    try {
      await updateVendorProfile(session.user.id, { payout_info: values });
      toast({ title: 'Payout info updated', description: 'Your payout information has been updated.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update payout info.', variant: 'destructive' });
    }
  });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payout Configuration</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Payment Mode</label>
            <Input value="Paystack" disabled className="bg-muted" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Bank Name</label>
            <Input {...form.register('bank_name', { required: true })} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Account Number</label>
            <Input {...form.register('account_number', { required: true })} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Account Name</label>
            <Input {...form.register('account_name', { required: true })} />
          </div>
          <FormActions
            onCancel={() => form.reset(initialFormData)}
            isSubmitting={form.formState.isSubmitting}
            submitText="Save Changes"
            submittingText="Saving..."
          />
        </form>
      </Form>
    </div>
  );
};

export default SettingsPayout;