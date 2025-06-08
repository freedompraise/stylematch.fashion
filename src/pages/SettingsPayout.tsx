// SettingsPayout.tsx

import React from 'react';
import { useVendor } from '@/contexts/VendorContext';
import { useToast } from '@/components/ui/use-toast';
import { PayoutForm, PayoutFormData } from '@/components/payout/PayoutForm';
import { paystackClient } from '@/lib/paystackClient';

const SettingsPayout: React.FC = () => {
  const { user, vendor, refreshVendor, updateVendorProfile } = useVendor();
  const { toast } = useToast();

  const handleSubmit = async (values: PayoutFormData) => {
    if (!user?.id) return;
    try {
      const result = await paystackClient.createRecipient({
        account_number: values.account_number,
        bank_code: values.bank_code,
        account_name: values.account_name,
        payout_mode: values.payout_mode
      });

      await updateVendorProfile({
        payout_info: {
          account_number: values.account_number,
          bank_code: values.bank_code,
          bank_name: values.bank_name,
          recipient_code: result.recipient_code,
          account_name: values.account_name,
          payout_mode: values.payout_mode
        }
      });

      await refreshVendor();
      toast({ 
        title: 'Payout info updated', 
        description: 'Your payout information has been updated.' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update payout info.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payout Configuration</h1>
      <PayoutForm
        initialData={vendor?.payout_info}
        onSubmit={handleSubmit}
        onCancel={() => {/* Reset to initial values */}}
      />
    </div>
  );
};

export default SettingsPayout;
