export interface VendorProfile {
  user_id: string;
  store_name: string;
  name: string;
  bio?: string;
  instagram_url?: string;
  facebook_url?: string;
  wabusiness_url?: string;
  phone?: string;
  banner_image_url?: string;
  payout_info?: {
    account_number?: string;
    bank_code?: string;
    bank_name?: string;
    recipient_code?: string;
    account_name?: string;
    payout_mode?: string;
  };
}