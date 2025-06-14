import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormActions } from '@/components/ui/form-actions';
import { Form } from '@/components/ui/form';
import { paystackClient } from '@/lib/paystackClient';
import { useToast } from '@/components/ui/use-toast';

export interface PayoutFormData {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  payout_mode: 'automatic' | 'manual';
}

interface PayoutFormProps {
  initialData?: PayoutFormData;
  onSubmit: (data: PayoutFormData) => Promise<void>;
  submitText?: string;
  submittingText?: string;
}

export const defaultInitialData: PayoutFormData = {
  bank_name: '',
  bank_code: '',
  account_number: '',
  account_name: '',
  payout_mode: 'automatic',
};

export const PayoutForm: React.FC<PayoutFormProps> = ({
  initialData,
  onSubmit,
  submitText = 'Save Changes',
  submittingText = 'Saving...'
}) => {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [bankError, setBankError] = useState('');
  const [formData, setFormData] = useState<PayoutFormData>(() => ({
    ...defaultInitialData,
    ...(initialData || {})
  }));
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const { toast } = useToast();
  
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
        setBankError('Failed to load banks. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load banks list. Please refresh the page.',
          variant: 'destructive'
        });
      }
    };
    loadBanks();
  }, [toast]);

  const resolveAccountName = async (bankCode: string, accountNumber: string) => {
    if (accountNumber.length !== 10) return;
    setResolving(true);
    setIsNameConfirmed(false);
    try {
      const result = await paystackClient.resolveAccount(bankCode, accountNumber);
      setResolvedAccountName(result.account_name);
      form.setValue('account_name', result.account_name);
      form.clearErrors('account_number');
      setFormData(prev => ({
        ...prev,
        account_name: result.account_name,
        bank_code: bankCode,
        account_number: accountNumber
      }));
    } catch (error) {
      setResolvedAccountName('');
      form.setValue('account_name', '');
      form.setError('account_number', {
        type: 'manual',
        message: 'Could not verify account number. Please check and try again.'
      });
    } finally {
      setResolving(false);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!isNameConfirmed) {
      toast({
        title: 'Action Required',
        description: 'Please click on the account name to confirm it is correct.',
        variant: 'destructive'
      });
      return;
    }
    try {
      await onSubmit(values);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save payout information. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const isFormValid = () => {
    return (
      form.getValues('bank_code') &&
      form.getValues('account_number')?.length === 10 &&
      resolvedAccountName &&
      isNameConfirmed
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Payout Mode</label>
          <select 
            {...form.register('payout_mode', { required: true })} 
            className="input w-full"
            onChange={(e) => setFormData(prev => ({ ...prev, payout_mode: e.target.value as 'automatic' | 'manual' }))
            }
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Bank</label>
          {bankError ? (
            <div className="text-red-500 text-sm mb-2">{bankError}</div>
          ) : null}
          <select
            {...form.register('bank_code', { required: true })}
            className="input w-full"
            onChange={async e => {
              const code = e.target.value;
              form.setValue('bank_code', code);
              const bank = banks.find(b => b.code === code);
              form.setValue('bank_name', bank?.name || '');
              setFormData(prev => ({
                ...prev,
                bank_code: code,
                bank_name: bank?.name || ''
              }));
              const accountNumber = form.getValues('account_number');
              if (accountNumber.length === 10) {
                await resolveAccountName(code, accountNumber);
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
            onChange={(e) => {
              form.setValue('account_number', e.target.value);
              setFormData(prev => ({ ...prev, account_number: e.target.value }));
            }}
            onBlur={async e => {
              const num = e.target.value;
              if (form.getValues('bank_code') && num.length === 10) {
                await resolveAccountName(form.getValues('bank_code'), num);
              }
            }}
          />
          {form.formState.errors.account_number && (
            <span className="text-red-500 text-sm">
              {form.formState.errors.account_number.message}
            </span>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Account Name</label>
          <div className="relative">
            <Input 
              {...form.register('account_name', { required: true })} 
              readOnly 
              value={resolvedAccountName}
              className={isNameConfirmed ? 'bg-green-50 border-green-300' : 'cursor-pointer hover:bg-gray-50'}
              onClick={() => {
                if (resolvedAccountName) {
                  setIsNameConfirmed(true);
                  toast({
                    title: 'Account Name Confirmed',
                    description: 'You have confirmed this is your account name.',
                  });
                }
              }}
            />
          </div>
          {resolving && <div className="text-xs text-gray-500">Resolving account name...</div>}
          {!resolving && resolvedAccountName && (
            <div className="mt-1 text-green-700 text-sm">
                <div className="text-sm text-blue-600 mt-1">
                👆 Click on the account name to confirm it is correct
              </div>
              Account Name: <strong>{resolvedAccountName}</strong>
            </div>
          )}
        </div>

        <FormActions
          isSubmitting={form.formState.isSubmitting}
          submitText={submitText}
          submittingText={submittingText}
          disabled={!isFormValid()}
        />
      </form>
    </Form>
  );
};