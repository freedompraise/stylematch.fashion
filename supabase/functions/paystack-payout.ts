// supabase/functions/paystack-payout.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';


const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY');

serve(async (req) => {
  const { action, data } = await req.json();

  if (action === 'list_banks') {
    const res = await fetch('https://api.paystack.co/bank?country=nigeria&type=nuban');
    const banks = await res.json();
    return new Response(JSON.stringify(banks), { status: 200 });
  }

  if (action === 'resolve_account') {
    const { account_number, bank_code } = data;
    const res = await fetch(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const result = await res.json();
    return new Response(JSON.stringify(result), { status: 200 });
  }

  if (action === 'create_recipient') {
    const { account_number, bank_code, account_name, payout_mode } = data;
    const res = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'nuban',
        name: account_name,
        account_number,
        bank_code,
        currency: 'NGN',
        // Paystack supports 'automatic' or 'manual'
        payout_mode: payout_mode || 'automatic'
      })
    });
    const result = await res.json();
    return new Response(JSON.stringify(result), { status: 200 });
  }

  return new Response('Invalid action', { status: 400 });
});