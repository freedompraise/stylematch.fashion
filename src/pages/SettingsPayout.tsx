// SettingsPayout.tsx

import React, { useEffect, useState } from 'react';
import { useVendor } from '@/contexts/VendorContext';
import { useToast } from '@/components/ui/use-toast';
import { PayoutForm, defaultInitialData } from '@/components/payout/PayoutForm';
import { PayoutFormData } from '@/types';
import { paystackClient } from '@/lib/paystackClient';
import { Button } from '@/components/ui/button';

const SettingsPayout: React.FC = () => {
  const { user, vendor, refreshVendor, updateVendorProfile } = useVendor();
  const { toast } = useToast();
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [payoutData, setPayoutData] = useState<PayoutFormData>(vendor?.payout_info as PayoutFormData || defaultInitialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState('');

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const bankList = await paystackClient.listBanks();
        setBanks(bankList);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load banks list. Please refresh the page.',
          variant: 'destructive'
        });
      }
    };
    loadBanks();
  }, [toast]);

  const handleResolveAccount = async (bankCode: string, accountNumber: string) => {
    const result = await paystackClient.resolveAccount(bankCode, accountNumber);
    setResolvedAccountName(result.account_name);
    return result;
  };

  const handlePayoutChange = (data: PayoutFormData) => {
    setPayoutData(data);
    // If we have a resolved account name, check if it matches
    if (resolvedAccountName && data.account_name === resolvedAccountName) {
      setIsNameConfirmed(true);
    }
  };

  const handleAccountNameConfirm = () => {
    if (resolvedAccountName) {
      setIsNameConfirmed(true);
      toast({
        title: 'Account Name Confirmed',
        description: 'You have confirmed this is your account name.',
      });
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!isNameConfirmed) {
      toast({
        title: 'Action Required',
        description: 'Please click on the account name to confirm it is correct.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await paystackClient.createRecipient({
        account_number: payoutData.account_number,
        bank_code: payoutData.bank_code,
        account_name: payoutData.account_name,
        payout_mode: payoutData.payout_mode
      });

      await updateVendorProfile({
        payout_info: {
          ...payoutData,
          recipient_code: result.recipient_code
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payout Configuration</h1>
      <PayoutForm
        initialData={payoutData}
        onChange={handlePayoutChange}
        banks={banks}
        onResolveAccount={handleResolveAccount}
        disabled={isSubmitting}
        onAccountNameConfirm={handleAccountNameConfirm}
        isNameConfirmed={isNameConfirmed}
        resolvedAccountName={resolvedAccountName}
      />
      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isNameConfirmed}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Save Payout Information'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPayout;
