// SettingsPayout.tsx

import React, { useEffect, useState } from 'react';
import { useVendor } from '@/contexts/VendorContext';
import { useVendorData } from '@/services/vendorDataService';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { FormActions } from '@/components/ui/form-actions';
import { Form } from '@/components/ui/form';

interface PayoutFormData {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  payout_mode: 'automatic' | 'manual';
}

const initialFormData: PayoutFormData = {
  bank_name: '',
  bank_code: '',
  account_number: '',
  account_name: '',
  payout_mode: 'automatic',
};

const SettingsPayout: React.FC = () => {
  const { user, vendor, refreshVendor } = useVendor();
  const { updateVendorProfile } = useVendorData();
  const { toast } = useToast();
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [resolving, setResolving] = useState(false);

  const form = useForm<PayoutFormData>({
    defaultValues: {
      ...initialFormData,
      ...(vendor?.payout_info || {})
    }
  });

  useEffect(() => {
    fetch('https://wtzvuiltqqajgyzzdcal.supabase.co/functions/v1/paystack-payout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'list_banks' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.data)) {
          const uniqueBanks = Array.from(
            new Map(data.data.map((bank: { name: string; code: string }) => [bank.code, bank])).values()
          ) as { name: string; code: string }[];
          setBanks(uniqueBanks);
        }
      });
  }, []);
  useEffect(() => {
    if (vendor?.payout_info) {
      const pm = vendor.payout_info.payout_mode === 'manual' ? 'manual' : 'automatic';
      form.reset({
        bank_name: vendor.payout_info.bank_name || '',
        bank_code: vendor.payout_info.bank_code || '',
        account_number: vendor.payout_info.account_number || '',
        account_name: vendor.payout_info.account_name || '',
        payout_mode: pm
      });
      setResolvedAccountName(vendor.payout_info.account_name || '');
    }
  }, [vendor, form]);

  const resolveAccountName = async (bank_code: string, account_number: string) => {
    if (account_number.length !== 10) return;
    setResolving(true);
    try {
      const res = await fetch('https://wtzvuiltqqajgyzzdcal.supabase.co/functions/v1/paystack-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'resolve_account',
          data: { bank_code, account_number }
        })
      });
      const result = await res.json();
      if (result.status && result.data?.account_name) {
        setResolvedAccountName(result.data.account_name);
        form.setValue('account_name', result.data.account_name);
      } else {
        setResolvedAccountName('');
        form.setValue('account_name', '');
      }
    } catch {
      setResolvedAccountName('');
      form.setValue('account_name', '');
    } finally {
      setResolving(false);
    }
  };
  const handleSubmit = form.handleSubmit(async values => {
    if (!user?.id) return;
    try {
      const res = await fetch('https://wtzvuiltqqajgyzzdcal.supabase.co/functions/v1/paystack-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'create_recipient',
          data: {
            account_number: values.account_number,
            bank_code: values.bank_code,
            account_name: values.account_name,
            payout_mode: values.payout_mode
          }
        })
      });
      const result = await res.json();
      if (!result.status || !result.data?.recipient_code) {
        throw new Error(result.message || 'Failed to create recipient');
      }      await updateVendorProfile(user.id, {
        payout_info: {
          account_number: values.account_number,
          bank_code: values.bank_code,
          bank_name: banks.find(b => b.code === values.bank_code)?.name || values.bank_name,
          recipient_code: result.data.recipient_code,
          account_name: values.account_name,
          payout_mode: values.payout_mode
        }
      });
      await refreshVendor();
      toast({ title: 'Payout info updated', description: 'Your payout information has been updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update payout info.', variant: 'destructive' });
    }
  });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payout Configuration</h1>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Payout Mode</label>
            <select {...form.register('payout_mode', { required: true })} className="input w-full">
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Bank</label>
            <select
              {...form.register('bank_code', { required: true })}
              className="input w-full"
              onChange={async e => {
                const code = e.target.value;
                form.setValue('bank_code', code);
                const bank = banks.find(b => b.code === code);
                form.setValue('bank_name', bank?.name || '');
                if (form.getValues('account_number').length === 10) {
                  await resolveAccountName(code, form.getValues('account_number'));
                }
              }}
              value={form.watch('bank_code')}
            >
              <option value="">Select Bank</option>
              {banks.map(b => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Account Number</label>
            <Input
              {...form.register('account_number', { required: true })}
              maxLength={10}
              onBlur={async e => {
                const num = e.target.value;
                if (form.getValues('bank_code') && num.length === 10) {
                  await resolveAccountName(form.getValues('bank_code'), num);
                }
              }}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Account Name</label>
            <Input {...form.register('account_name', { required: true })} readOnly value={resolvedAccountName} />
            {resolving && <div className="text-xs text-gray-500">Resolving account name...</div>}
            {!resolving && resolvedAccountName && (
              <div className="mt-1 text-green-700 text-sm">
                Account Name: <strong>{resolvedAccountName}</strong>
              </div>
            )}
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
