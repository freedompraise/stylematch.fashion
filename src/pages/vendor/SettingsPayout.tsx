// SettingsPayout.tsx

import React, { useState } from 'react';
import { useVendorStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const payoutFormSchema = z.object({
  bank_name: z.string().min(1, 'Bank name is required'),
  account_number: z.string().length(10, 'Account number must be 10 digits'),
  account_name: z.string().min(1, 'Account name is required'),
});

type PayoutFormValues = z.infer<typeof payoutFormSchema>;

export function SettingsPayout() {
  const { vendor, updateVendorProfile } = useVendorStore();

  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutFormSchema),
    defaultValues: {
      bank_name: vendor?.payout_info?.bank_name || '',
      account_number: vendor?.payout_info?.account_number || '',
      account_name: vendor?.payout_info?.account_name || '',
    },
  });

  useEffect(() => {
    if (vendor?.payout_info) {
      form.reset(vendor.payout_info);
    }
  }, [vendor, form]);

  async function onSubmit(data: PayoutFormValues) {
    try {
      await updateVendorProfile({ payout_info: data });
      toast.payouts.updateSuccess();
    } catch (error) {
      toast.payouts.updateError();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payout Settings</h1>
        <p className="text-muted-foreground">
          Configure your bank account details for receiving payments.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account Information</CardTitle>
          <CardDescription>
            Update your bank account details for payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name</Label>
              <Input
                id="bank_name"
                {...form.register('bank_name')}
                placeholder="Enter your bank name"
              />
              {form.formState.errors.bank_name && (
                <p className="text-sm text-destructive">{form.formState.errors.bank_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                {...form.register('account_number')}
                placeholder="Enter your account number"
                maxLength={10}
              />
              {form.formState.errors.account_number && (
                <p className="text-sm text-destructive">{form.formState.errors.account_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                {...form.register('account_name')}
                placeholder="Enter account holder name"
              />
              {form.formState.errors.account_name && (
                <p className="text-sm text-destructive">{form.formState.errors.account_name.message}</p>
              )}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Updating...' : 'Update Payout Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPayout;
