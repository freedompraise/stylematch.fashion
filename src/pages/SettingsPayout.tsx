// SettingsPayout.tsx

import React, { useState, useEffect } from 'react';
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
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [payoutData, setPayoutData] = useState<PayoutFormData>(
    defaultInitialData
  );

  useEffect(() => {
    if (vendor?.payout_info) {
      setPayoutData(vendor.payout_info as PayoutFormData);
      setResolvedAccountName(vendor.payout_info.account_name || '');
      // If a recipient code exists, it means the info is saved and confirmed.
      setIsNameConfirmed(!!vendor.payout_info.recipient_code);
    }
  }, [vendor]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const bankList = await paystackClient.listBanks();
        setBanks(bankList);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not fetch bank list.',
          variant: 'destructive',
        });
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, [toast]);

  const handleResolveAccount = async (bankCode: string, accountNumber: string) => {
    setIsNameConfirmed(false); // Force re-confirmation on new resolution
    try {
      const result = await paystackClient.resolveAccount(bankCode, accountNumber);
      setResolvedAccountName(result.account_name);
      return result;
    } catch (error) {
      setResolvedAccountName('');
      toast({
        title: 'Could not verify account',
        description: 'Please check the bank and account number.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    if (!isNameConfirmed) {
      toast({
        title: 'Confirm Account Name',
        description: 'Please confirm the resolved account name before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await paystackClient.createRecipient({
        account_number: payoutData.account_number,
        bank_code: payoutData.bank_code,
        account_name: payoutData.account_name,
        payout_mode: payoutData.payout_mode
      });

      await updateVendorProfile({
        payout_info: {
          ...payoutData,
          bank_name: banks.find(b => b.code === payoutData.bank_code)?.name || payoutData.bank_name,
          recipient_code: result.recipient_code,
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
      <div className="space-y-6">
        <PayoutForm
          initialData={payoutData}
          onChange={setPayoutData}
          banks={banks}
          onResolveAccount={handleResolveAccount}
          disabled={loadingBanks || isSubmitting}
          onAccountNameConfirm={() => setIsNameConfirmed(true)}
          isNameConfirmed={isNameConfirmed}
          resolvedAccountName={resolvedAccountName}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting || loadingBanks || !isNameConfirmed}>
          {isSubmitting ? 'Saving...' : 'Save Payout Information'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPayout;
