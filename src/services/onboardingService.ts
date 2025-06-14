
import { vendorProfileService } from './vendorProfileService';
import { paystackClient } from '@/lib/paystackClient';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary';
import { PayoutFormData } from '@/types';

interface OnboardingTransaction {
  imageUrl?: string;
  imagePublicId?: string;
  recipientCode?: string;
  vendorProfileCreated?: boolean;
}

interface OnboardingData {
  store_name: string;
  name: string;
  phone?: string;
  bio: string;
  instagram_url?: string;
  facebook_url?: string;
  wabusiness_url?: string;
  imageFile?: File;
  payout: PayoutFormData;
}

class OnboardingService {
  async executeOnboarding(userId: string, data: OnboardingData): Promise<void> {
    const transaction: OnboardingTransaction = {};
    
    try {
      console.log('Starting vendor onboarding transaction for user:', userId);
      
      // Step 1: Upload image if provided
      if (data.imageFile) {
        console.log('Uploading image to Cloudinary...');
        transaction.imageUrl = await uploadToCloudinary(data.imageFile);
        transaction.imagePublicId = getPublicIdFromUrl(transaction.imageUrl);
        console.log('Image uploaded successfully:', transaction.imageUrl);
      }

      // Step 2: Create Paystack recipient
      console.log('Creating Paystack recipient...');
      const recipientResult = await paystackClient.createRecipient({
        account_number: data.payout.account_number,
        bank_code: data.payout.bank_code,
        account_name: data.payout.account_name,
        payout_mode: data.payout.payout_mode
      });
      transaction.recipientCode = recipientResult.recipient_code;
      console.log('Paystack recipient created:', transaction.recipientCode);

      // Step 3: Create vendor profile
      console.log('Creating vendor profile...');
      await vendorProfileService.createVendorProfile(userId, {
        store_name: data.store_name,
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        banner_image_url: transaction.imageUrl,
        instagram_url: data.instagram_url,
        facebook_url: data.facebook_url,
        wabusiness_url: data.wabusiness_url,
        payout_info: {
          ...data.payout,
          recipient_code: transaction.recipientCode,
        },
        verification_status: 'pending'
      });
      transaction.vendorProfileCreated = true;
      console.log('Vendor profile created successfully');

    } catch (error) {
      console.error('Onboarding transaction failed:', error);
      await this.rollbackTransaction(transaction);
      throw error;
    }
  }

  private async rollbackTransaction(transaction: OnboardingTransaction): Promise<void> {
    console.log('Rolling back onboarding transaction...');
    
    // Rollback in reverse order
    try {
      // Note: We can't easily rollback Paystack recipient creation or vendor profile creation
      // These would need to be handled through their respective APIs if available
      
      // Rollback image upload
      if (transaction.imagePublicId) {
        console.log('Cleaning up uploaded image:', transaction.imagePublicId);
        await deleteFromCloudinary(transaction.imagePublicId);
      }
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
      // Log the rollback error but don't throw it to avoid masking the original error
    }
  }

  async validateStoreNameUnique(storeName: string, excludeUserId?: string): Promise<boolean> {
    // This would need to be implemented with a database query
    // For now, we'll return true (assuming unique)
    // TODO: Implement actual uniqueness check
    return true;
  }
}

export const onboardingService = new OnboardingService();
