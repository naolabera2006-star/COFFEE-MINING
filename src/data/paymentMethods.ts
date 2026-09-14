export interface PaymentMethodConfig {
  id: 'cbe' | 'awash' | 'telebirr' | 'cbo';
  name: string;
  shortName: string;
  fullName: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  prefix: string;
  popular?: boolean;
  type: 'bank' | 'mobile_money';
  badgeColor: string;
  accentColor: string;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'cbe',
    name: 'CBE Bank',
    shortName: 'CBE',
    fullName: 'Commercial Bank of Ethiopia (CBE)',
    provider: 'CBE Mobile / Internet Banking',
    accountName: 'Coffee Mining Agrotech PLC',
    accountNumber: '1000 4829 1048',
    prefix: 'CBE-',
    popular: true,
    type: 'bank',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentColor: 'text-purple-400'
  },
  {
    id: 'awash',
    name: 'Awash Bank',
    shortName: 'Awash',
    fullName: 'Awash International Bank',
    provider: 'Awash Direct Transfer',
    accountName: 'Coffee Mining Agrotech PLC',
    accountNumber: '0130 9281 9201',
    prefix: 'AWB-',
    popular: false,
    type: 'bank',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    accentColor: 'text-blue-400'
  },
  {
    id: 'telebirr',
    name: 'Telebirr',
    shortName: 'Telebirr',
    fullName: 'Telebirr Mobile Money',
    provider: 'Telebirr Digital Transfer',
    accountName: 'Coffee Mining Agrotech PLC',
    accountNumber: '0911 234 567',
    prefix: 'TB-',
    popular: true,
    type: 'mobile_money',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentColor: 'text-emerald-400'
  },
  {
    id: 'cbo',
    name: 'CBO',
    shortName: 'CBO',
    fullName: 'Cooperative Bank of Oromia (CBO)',
    provider: 'CoopPay / CBO Mobile',
    accountName: 'Coffee Mining Agrotech PLC',
    accountNumber: '1004 9281 0492',
    prefix: 'CBO-',
    popular: false,
    type: 'bank',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    accentColor: 'text-amber-400'
  }
];

export const getPaymentMethodById = (id?: string): PaymentMethodConfig => {
  if (!id) return PAYMENT_METHODS[0];
  const found = PAYMENT_METHODS.find(m => m.id === id.toLowerCase() || m.name.toLowerCase().includes(id.toLowerCase()));
  return found || PAYMENT_METHODS[0];
};
