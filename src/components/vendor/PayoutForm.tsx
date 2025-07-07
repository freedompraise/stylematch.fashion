import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { PayoutFormData } from '@/types';

interface PayoutFormProps {
  initialData?: PayoutFormData;
  onChange: (data: PayoutFormData) => void;
  banks: { name: string; code: string }[];
  onResolveAccount: (bankCode: string, accountNumber: string) => Promise<{ account_name: string }>;
  disabled?: boolean;
  onAccountNameConfirm?: () => void;
  isNameConfirmed?: boolean;
  resolvedAccountName?: string;
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
  onChange,
  banks,
  onResolveAccount,
  disabled = false,
  onAccountNameConfirm,
  isNameConfirmed = false,
  resolvedAccountName: externalResolvedName
}) => {
  const [resolvedAccountName, setResolvedAccountName] = useState(externalResolvedName || '');
  const [resolving, setResolving] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<PayoutFormData>({
    defaultValues: {
      ...defaultInitialData,
      ...initialData
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ ...defaultInitialData, ...initialData });
    }
  }, [initialData, form.reset]);

  const resolveAccountName = async (bankCode: string, accountNumber: string) => {
    if (accountNumber.length !== 10) return;
    setResolving(true);
    try {
      const result = await onResolveAccount(bankCode, accountNumber);
      setResolvedAccountName(result.account_name);
      form.setValue('account_name', result.account_name);
      form.clearErrors('account_number');
      
      // Notify parent of changes
      const currentValues = form.getValues();
      onChange({
        ...currentValues,
        account_name: result.account_name
      });
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

  const handleFieldChange = (field: keyof PayoutFormData, value: any) => {
    form.setValue(field, value);
    const currentValues = form.getValues();
    onChange(currentValues);
  };

  const handleAccountNameClick = () => {
    if (resolvedAccountName && onAccountNameConfirm) {
      onAccountNameConfirm();
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Payout Mode</label>
          <select 
            {...form.register('payout_mode', { required: true })} 
            className="input w-full"
            onChange={(e) => handleFieldChange('payout_mode', e.target.value)}
            disabled={disabled}
          >
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
              const bank = banks.find(b => b.code === code);
              handleFieldChange('bank_code', code);
              handleFieldChange('bank_name', bank?.name || '');
              
              const accountNumber = form.getValues('account_number');
              if (accountNumber.length === 10) {
                await resolveAccountName(code, accountNumber);
              }
            }}
            value={form.watch('bank_code')}
            disabled={disabled}
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
              handleFieldChange('account_number', e.target.value);
            }}
            onBlur={async e => {
              const num = e.target.value;
              if (form.getValues('bank_code') && num.length === 10) {
                await resolveAccountName(form.getValues('bank_code'), num);
              }
            }}
            disabled={disabled}
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
              onClick={handleAccountNameClick}
              disabled={disabled}
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
      </form>
    </Form>
  );
};
