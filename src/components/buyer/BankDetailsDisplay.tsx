// src/components/buyer/BankDetailsDisplay.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface BankDetailsDisplayProps {
  bankDetails: {
    bank_name: string;
    account_number: string;
    account_name: string;
    bank_code?: string;
  };
  storeName: string;
}

const BankDetailsDisplay: React.FC<BankDetailsDisplayProps> = ({ bankDetails, storeName }) => {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Please copy manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Bank Transfer Details
        </CardTitle>
        <CardDescription>
          Transfer the exact amount to {storeName}'s account below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">{bankDetails.bank_name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.bank_name, 'Bank name')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Account Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Account Number</label>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-mono text-lg font-bold">{bankDetails.account_number}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.account_number, 'Account number')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Account Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Account Name</label>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">{bankDetails.account_name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(bankDetails.account_name, 'Account name')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-amber-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Important:</p>
              <ul className="text-amber-700 space-y-1 text-xs">
                <li>• Transfer the exact amount shown in your order</li>
                <li>• Use your order ID as the transfer reference</li>
                <li>• Upload payment proof after completing the transfer</li>
                <li>• Your order will be processed within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankDetailsDisplay;
