// src/constants/banks.ts
export interface Bank {
  name: string;
  code: string;
}

export const BANKS: Bank[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'Access Bank (Diamond)', code: '063' },
  { name: 'ALAT by WEMA', code: '035A' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank', code: '030' }, // (if needed, confirm code in your dataset)
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Lotus Bank', code: '303' },
  { name: 'Opay Digital Services Limited (OPay)', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Parallex Bank', code: '104' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'PremiumTrust Bank', code: '105' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Rubies MFB', code: '125' },
  { name: 'Signature Bank Ltd', code: '106' },
  { name: 'Sparkle Microfinance Bank', code: '51310' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Suntrust Bank', code: '100' },
  { name: 'TAJ Bank', code: '302' },
  { name: 'Titan Bank', code: '102' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank For Africa', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Coronation Merchant Bank', code: '559' },
  { name: 'FSDH Merchant Bank Limited', code: '501' },
  { name: 'Rand Merchant Bank', code: '502' },
  { name: 'Optimus Bank Limited', code: '107' },
  { name: 'NOVA BANK', code: '561' },
  { name: 'Carbon', code: '565' },
  { name: 'Fairmoney Microfinance Bank', code: '51318' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'VFD Microfinance Bank Limited', code: '566' },
  { name: 'GoMoney', code: '100022' },
  { name: 'Paga', code: '100002' },
  { name: 'MTN Momo PSB', code: '120003' },
  { name: 'Airtel Smartcash PSB', code: '120004' },
  { name: 'HopePSB', code: '120002' },
  { name: 'Money Master PSB', code: '946' }
];

export function getBanks(): Bank[] {
  return BANKS;
}
