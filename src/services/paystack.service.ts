import { PaystackPayment } from '@/types';

export class PaystackService {
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    this.secretKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
  }

  async initializePayment(data: {
    email: string;
    amount: number;
    currency: string;
    reference: string;
    callback_url: string;
    metadata?: Record<string, any>;
  }): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        amount: data.amount * 100, // Convert to kobo
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize payment');
    }

    const result = await response.json();
    return result.data;
  }

  async verifyPayment(reference: string): Promise<PaystackPayment> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify payment');
    }

    const result = await response.json();
    return result.data;
  }

  async createSubaccount(data: {
    business_name: string;
    bank_code: string;
    account_number: string;
    percentage_charge: number;
  }): Promise<{ subaccount_code: string }> {
    const response = await fetch(`${this.baseUrl}/subaccount`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subaccount');
    }

    const result = await response.json();
    return result.data;
  }

  async initiateTransfer(data: {
    source: string;
    reason: string;
    amount: number;
    recipient: string;
  }): Promise<{ transfer_code: string }> {
    const response = await fetch(`${this.baseUrl}/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        amount: data.amount * 100, // Convert to kobo
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initiate transfer');
    }

    const result = await response.json();
    return result.data;
  }

  async verifyTransfer(transferCode: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/transfer/verify/${transferCode}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify transfer');
    }

    const result = await response.json();
    return result.data;
  }
}

export const paystackService = new PaystackService(); 