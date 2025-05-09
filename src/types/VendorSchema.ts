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
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
}