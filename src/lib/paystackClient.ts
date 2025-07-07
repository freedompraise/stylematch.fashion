const PAYSTACK_EDGE_URL = import.meta.env.VITE_PAYSTACK_EDGE_URL
const AUTH_HEADER = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

interface Bank {
  name: string;
  code: string;
}

interface AccountResolution {
  account_name: string;
  account_number: string;
  bank_id: number;
}

interface SubaccountResponse {
  subaccount_code: string;
}

class PaystackClient {
  private async request<T>(action: string, data?: any): Promise<T> {
    const response = await fetch(PAYSTACK_EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': AUTH_HEADER
      },
      body: JSON.stringify({ action, data })
    });

    const result = await response.json();
    if (!result.status) {
      throw new Error(result.message || 'Paystack operation failed');
    }

    return result.data;
  }

  async listBanks(): Promise<Bank[]> {
    const banks = await this.request<Bank[]>('list_banks');
    // Remove duplicates based on bank code
    return Array.from(
      new Map(banks.map(bank => [bank.code, bank])).values()
    );
  }

  async resolveAccount(bankCode: string, accountNumber: string): Promise<AccountResolution> {
    return this.request<AccountResolution>('resolve_account', {
      bank_code: bankCode,
      account_number: accountNumber
    });
  }

  async createSubaccount(data: {
    business_name: string;
    bank_code: string;
    account_number: string;
    percentage_charge: number;
  }): Promise<SubaccountResponse> {
    return this.request<SubaccountResponse>('create_subaccount', data);
  }
}

export const paystackClient = new PaystackClient();
export type { SubaccountResponse }; 