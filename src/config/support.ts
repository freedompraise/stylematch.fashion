// src/config/support.ts

export const SUPPORT_CONFIG = {
  whatsappNumber: '2349074577147', // StyleMatch support WhatsApp number
  supportEmail: 'marketmatchofficial@gmail.com', // StyleMatch support email
  businessHours: 'Monday - Friday, 9 AM - 6 PM (WAT)', // Business hours
  location: 'Lagos, Nigeria', // Company location
} as const;

export const getWhatsAppUrl = (message?: string, isVendor: boolean = true) => {
  const defaultMessage = isVendor
    ? "Hi! I need help with my StyleMatch vendor account."
    : "Hi! I need help with StyleMatch.";
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${SUPPORT_CONFIG.whatsappNumber}?text=${encodedMessage}`;
};
