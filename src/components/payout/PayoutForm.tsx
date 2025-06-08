import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormActions } from '@/components/ui/form-actions';
import { Form } from '@/components/ui/form';
import { paystackClient } from '@/lib/paystackClient';

export interface PayoutFormData {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  payout_mode: 'automatic' | 'manual';
}

interface PayoutFormProps {
  initialData?: Partial<PayoutFormData>;
  onSubmit: (data: PayoutFormData) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  submittingText?: string;
}

const defaultInitialData: PayoutFormData = {
  bank_name: '',
  bank_code: '',
  account_number: '',
  account_name: '',
  payout_mode: 'automatic',
};

export const PayoutForm: React.FC<PayoutFormProps> = ({
  initialData = defaultInitialData,
  onSubmit,
  onCancel,
  submitText = 'Save Changes',
  submittingText = 'Saving...'
}) => {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [resolving, setResolving] = useState(false);

  const form = useForm<PayoutFormData>({
    defaultValues: {
      ...defaultInitialData,
      ...initialData
    }
  });

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const bankList = await paystackClient.listBanks();
        setBanks(bankList);
      } catch (error) {
        console.error('Failed to load banks:', error);
      }
    };
    loadBanks();
  }, []);

  const resolveAccountName = async (bankCode: string, accountNumber: string) => {
    if (accountNumber.length !== 10) return;
    setResolving(true);
    try {
      const result = await paystackClient.resolveAccount(bankCode, accountNumber);
      setResolvedAccountName(result.account_name);
      form.setValue('account_name', result.account_name);
    } catch {
      setResolvedAccountName('');
      form.setValue('account_name', '');
    } finally {
      setResolving(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
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
          onCancel={onCancel}
          isSubmitting={form.formState.isSubmitting}
          submitText={submitText}
          submittingText={submittingText}
        />
      </form>
    </Form>
  );
}; 