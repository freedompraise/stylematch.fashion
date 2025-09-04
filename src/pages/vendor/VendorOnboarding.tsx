import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Instagram, Facebook, MessageCircle, AlertCircle } from 'lucide-react';
import { paystackClient } from '@/lib/paystackClient';
import { useVendorStore, useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Logo from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { PayoutForm, defaultInitialData } from '@/components/vendor/PayoutForm';
import { PayoutFormData } from '@/types';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { StoreImageUpload } from '@/components/vendor/StoreImageUpload';

const basicsSchema = z.object({
  store_name: z.string().min(2, { message: 'Store name is required' }).max(50, { message: 'Store name should be less than 50 characters' }),
  name: z.string().min(2, { message: 'Your name is required' }),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,15}$/, { message: 'Please enter a valid phone number' })
    .optional(),
});

const detailsSchema = z.object({
  bio: z.string().min(10, { message: 'Bio should be at least 10 characters' }).max(500, { message: 'Bio should be less than 500 characters' }),
});

const socialSchema = z.object({
  instagram_link: z.string().optional(),
  facebook_link: z.string().optional(),
  wabusiness_link: z.string().optional(),
});

const VendorOnboarding: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();
const { createVendorProfile} = useVendorStore();
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  
  const {
    state,
    updateBasics,
    updateDetails,
    updateSocial,
    updatePayout,
    setStep,
    setSubmitting,
    setError,
    clearError,
    clearState,
  } = useOnboardingState();
  const [imageFile, setImageFile] = useState<File | null>(state.formData.details.uploadedImageFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(state.formData.details.uploadedImage);

  const form = useForm({
    resolver: zodResolver(
      state.step === 1 ? basicsSchema :
      state.step === 2 ? detailsSchema :
      socialSchema
    ),
    defaultValues: {
      store_name: '',
      name: '',
      phone: '',
      bio: '',
      instagram_link: '',
      facebook_link: '',
      wabusiness_link: '',
    },
  });

  // Debug: Log current state and form values
  useEffect(() => {
    console.log('=== COMPONENT STATE DEBUG ===');
    console.log('Current state:', state);
    console.log('Form default values:', form.getValues());
    console.log('Form state:', form.formState);
  }, [state, form]);

  // Sync form values with state when state changes
  useEffect(() => {
    console.log('=== SYNCING FORM VALUES ===');
    console.log('Syncing form with state:', state.formData);
    console.log('Current step:', state.step);
    
    if (state.step === 1) {
      const basics = state.formData.basics;
      console.log('Setting basics form values:', basics);
      form.setValue('store_name', basics.store_name || '');
      form.setValue('name', basics.name || '');
      form.setValue('phone', basics.phone || '');
    } else if (state.step === 2) {
      const details = state.formData.details;
      console.log('Setting details form values:', details);
      form.setValue('bio', details.bio || '');
    } else if (state.step === 3) {
      const social = state.formData.social;
      console.log('Setting social form values:', social);
      form.setValue('instagram_link', social.instagram_link || '');
      form.setValue('facebook_link', social.facebook_link || '');
      form.setValue('wabusiness_link', social.wabusiness_link || '');
    }
    
    console.log('Form values after sync:', form.getValues());
  }, [state.formData, state.step, form]);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const bankList = await paystackClient.listBanks();
        setBanks(bankList);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load banks list. Please refresh the page.',
          variant: 'destructive'
        });
      }
    };
    loadBanks();
  }, [toast]);

  const handleImageFileChange = (file: File | null) => {
    console.log('handleImageFileChange called with:', file);
    setImageFile(file);
      updateDetails({ uploadedImageFile: file });
    console.log('updateDetails called for uploadedImageFile');
  };
  
  const handlePreviewUrlChange = (url: string | null) => {
    console.log('handlePreviewUrlChange called with:', url);
    setPreviewUrl(url);
    updateDetails({ uploadedImage: url });
    console.log('updateDetails called for uploadedImage');
  };

  const handlePhoneChange = (value: string) => {
    // Remove all non-phone characters except digits, spaces, dashes, parentheses, and plus
    const sanitized = value.replace(/[^\d\s\-\(\)\+]/g, '');
    
    // Limit length to 15 characters
    const truncated = sanitized.slice(0, 15);
    
    // Update form value
    form.setValue('phone', truncated);
    
    // Update local state
    updateBasics({ phone: truncated });
  };

  const handleResolveAccount = async (bankCode: string, accountNumber: string) => {
    return await paystackClient.resolveAccount(bankCode, accountNumber);
  };

  const validateStep = async () => {
    if (state.step === 1) {
      return await form.trigger(['store_name', 'name', 'phone']);
    } else if (state.step === 2) {
      return await form.trigger(['bio']);
    } else if (state.step === 3) {
      return await form.trigger(['instagram_link', 'facebook_link', 'wabusiness_link']);
    }
    return true;
  };

  const handleNextStep = async () => {
    console.log('=== NEXT STEP DEBUG ===');
    console.log('Current step:', state.step);
    console.log('Form values:', form.getValues());
    
    const isValid = await validateStep();
    console.log('Form validation result:', isValid);
    
    if (isValid) {
      const formValues = form.getValues();
      console.log('Form is valid, saving values:', formValues);
      
      if (state.step === 1) {
        console.log('Updating basics with:', formValues);
        updateBasics({
          store_name: formValues.store_name,
          name: formValues.name,
          phone: formValues.phone,
        });
      } else if (state.step === 2) {
        console.log('Updating details with:', formValues);
        updateDetails({ bio: formValues.bio });
      } else if (state.step === 3) {
        console.log('Updating social with:', formValues);
        updateSocial({
          instagram_link: formValues.instagram_link,
          facebook_link: formValues.facebook_link,
          wabusiness_link: formValues.wabusiness_link,
        });
      }
      
      // Wait a bit for state to update before moving to next step
      setTimeout(() => {
        console.log('Moving to step:', state.step + 1);
      setStep(state.step + 1);
      }, 100);
    } else {
      console.log('Validation failed');
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
    }
  };

  const handlePreviousStep = () => {
    setStep(state.step - 1);
  };

  const handlePayoutChange = (data: PayoutFormData) => {
    updatePayout(data);
  };

  const handleCompleteOnboarding = async () => {
    console.log('=== ONBOARDING SUBMISSION DEBUG ===');
    console.log('User:', user);
    console.log('Form state:', state);
    console.log('Form data basics:', state.formData.basics);
    console.log('Form data details:', state.formData.details);
    console.log('Form data payout:', state.formData.payout);
    
    if (!user) {
      console.log('ERROR: User not found');
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    if (!state.formData.payout) {
      console.log('ERROR: Payout data missing');
      toast({
        title: 'Error',
        description: 'Please complete the payout information.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      clearError('submission');

      console.log('Checking required fields:');
      console.log('- store_name:', state.formData.basics.store_name, 'valid:', !!state.formData.basics.store_name);
      console.log('- name:', state.formData.basics.name, 'valid:', !!state.formData.basics.name);
      console.log('- bio:', state.formData.details.bio, 'valid:', !!state.formData.details.bio);

      // Also check current form values
      const currentFormValues = form.getValues();
      console.log('Current form values:', currentFormValues);
      console.log('- form store_name:', currentFormValues.store_name, 'valid:', !!currentFormValues.store_name);
      console.log('- form name:', currentFormValues.name, 'valid:', !!currentFormValues.name);
      console.log('- form bio:', currentFormValues.bio, 'valid:', !!currentFormValues.bio);

      if (!state.formData.basics.store_name || !state.formData.basics.name || !state.formData.details.bio) {
        console.log('ERROR: Missing required form data in state');
        console.log('Attempting to get data from current form values...');
        
        // Try to get data from current form values as fallback
        const fallbackData = {
          store_name: currentFormValues.store_name || state.formData.basics.store_name,
          name: currentFormValues.name || state.formData.basics.name,
          bio: currentFormValues.bio || state.formData.details.bio,
        };
        
        console.log('Fallback data:', fallbackData);
        
        if (!fallbackData.store_name || !fallbackData.name || !fallbackData.bio) {
          console.log('ERROR: Still missing required form data after fallback');
          setError('submission', 'Missing required form data');
          return;
        }
        
        // Use fallback data
        console.log('Using fallback data for submission');
      }
      
      // Prepare final submission data
      const finalSubmissionData = {
        store_name: state.formData.basics.store_name || currentFormValues.store_name,
        name: state.formData.basics.name || currentFormValues.name,
        phone: state.formData.basics.phone || currentFormValues.phone,
        bio: state.formData.details.bio || currentFormValues.bio,
        instagram_url: state.formData.social.instagram_link || currentFormValues.instagram_link,
        facebook_url: state.formData.social.facebook_link || currentFormValues.facebook_link,
        wabusiness_url: state.formData.social.wabusiness_link || currentFormValues.wabusiness_link,
      };
      
      console.log('Final submission data prepared:', finalSubmissionData);
      
      // Validate final data
      if (!finalSubmissionData.store_name || !finalSubmissionData.name || !finalSubmissionData.bio) {
        console.log('ERROR: Final validation failed');
        setError('submission', 'Missing required form data');
        return;
      }

      const payoutInfo = state.formData.payout;

      console.log('[Onboarding] Creating Paystack subaccount with:', {
        business_name: finalSubmissionData.store_name,
        bank_code: payoutInfo.bank_code,
        account_number: payoutInfo.account_number,
        percentage_charge: 2
      });
      const subaccountResult = await paystackClient.createSubaccount({
        business_name: finalSubmissionData.store_name,
        bank_code: payoutInfo.bank_code,
        account_number: payoutInfo.account_number,
        percentage_charge: 2 // 2% to platform
      });
      console.log('[Onboarding] Subaccount creation result:', subaccountResult);

      const payout_info_payload = {
        ...payoutInfo,
        subaccount_code: subaccountResult.subaccount_code
      };
      console.log('[Onboarding] Submitting vendor profile with payout_info:', payout_info_payload);
      console.log('[Onboarding] Final submission data:', {
        store_name: state.formData.basics.store_name,
        name: state.formData.basics.name,
        phone: state.formData.basics.phone,
        bio: state.formData.details.bio,
        instagram_url: state.formData.social.instagram_link,
        facebook_url: state.formData.social.facebook_link,
        wabusiness_url: state.formData.social.wabusiness_link,
        payout_info: payout_info_payload,
      });

      await createVendorProfile(user.id, {
        store_name: finalSubmissionData.store_name,
        name: finalSubmissionData.name,
        phone: finalSubmissionData.phone,
        bio: finalSubmissionData.bio,
        instagram_url: finalSubmissionData.instagram_url,
        facebook_url: finalSubmissionData.facebook_url,
        wabusiness_url: finalSubmissionData.wabusiness_url,
        payout_info: payout_info_payload,
      }, imageFile || undefined);

      clearState();
      
      toast({
        title: 'Onboarding Complete',
        description: 'Your store profile has been successfully set up.',
      });
      
      navigate('/vendor/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      setError('submission', errorMessage);
      
      toast({
        title: 'Error',
        description: `${errorMessage}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-center">
          <Logo />
        </div>
      </header>
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-baseContent">Complete Your Store Profile</h1>
            <p className="text-baseContent-secondary mt-2">
              Let's set up your fashion business for success
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex mb-8 justify-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${state.step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`w-16 h-1 ${state.step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <div className={`w-16 h-1 ${state.step >= 4 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  4
                </div>
              </div>
            </div>

            {state.errors.submission && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.errors.submission}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {state.step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-baseContent">Store Basics</h2>
                    <FormField
                      control={form.control}
                      name="store_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your Fashion Store" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Full Name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Phone Number (e.g., +234 123 456 7890)"
                              type="tel"
                              value={field.value || ''}
                              onChange={(e) => handlePhoneChange(e.target.value)}
                              pattern="[\+]?[0-9\s\-\(\)]{7,15}"
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pt-4 flex justify-end">
                      <Button type="button" onClick={handleNextStep}>
                        Continue
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {state.step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-baseContent">Store Details</h2>
                    <div>
                      <label className="block text-sm font-medium text-baseContent mb-2">
                        Store Logo
                      </label>
                      <StoreImageUpload
                        imageFile={imageFile}
                        onImageFileChange={handleImageFileChange}
                        previewUrl={previewUrl}
                        onPreviewUrlChange={handlePreviewUrlChange}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell customers about your fashion business..."
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handlePreviousStep}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleNextStep}
                      >
                        Continue
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {state.step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-baseContent">Social Media Links</h2>
                    <p className="text-baseContent-secondary text-sm">
                      Connect your social media accounts to help customers find you across platforms
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="instagram_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram Profile</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <Input 
                                placeholder="https://instagram.com/yourstorename" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="facebook_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Page</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <Input 
                                placeholder="https://facebook.com/yourstorepage" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="wabusiness_link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whatsapp Business Link</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <Input 
                                placeholder="https://wa.me/yourwhatsapplink"
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4 flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handlePreviousStep}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleNextStep}
                      >
                        Continue
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {state.step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-baseContent">Payout Information</h2>
                    <p className="text-baseContent-secondary text-sm">
                      Set up how you'd like to receive payments from your sales
                    </p>
                    <div className="mb-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handlePreviousStep}
                      >
                        Back
                      </Button>                    
                    </div>
                    <div>
                      <PayoutForm
                        initialData={state.formData.payout || defaultInitialData}
                        onChange={handlePayoutChange}
                        banks={banks}
                        onResolveAccount={handleResolveAccount}
                        disabled={state.isSubmitting}
                      />
                    </div>
                    <div className="mt-6">
                      <Button
                        type="button"
                        onClick={handleCompleteOnboarding}
                        disabled={state.isSubmitting}
                        className="w-full"
                      >
                        {state.isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
