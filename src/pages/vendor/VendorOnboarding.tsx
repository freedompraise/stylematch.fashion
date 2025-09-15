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
import SupportChat from '@/components/SupportChat';

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
const { createVendorProfile, completeOnboarding } = useVendorStore();
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


  // Sync form values with state when step changes
  useEffect(() => {
    if (state.step === 1) {
      const basics = state.formData.basics;
      form.setValue('store_name', basics.store_name || '');
      form.setValue('name', basics.name || '');
      form.setValue('phone', basics.phone || '');
    } else if (state.step === 2) {
      const details = state.formData.details;
      form.setValue('bio', details.bio || '');
    } else if (state.step === 3) {
      const social = state.formData.social;
      form.setValue('instagram_link', social.instagram_link || '');
      form.setValue('facebook_link', social.facebook_link || '');
      form.setValue('wabusiness_link', social.wabusiness_link || '');
    }
  }, [state.step]);

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
    setImageFile(file);
    updateDetails({ uploadedImageFile: file });
  };
  
  const handlePreviewUrlChange = (url: string | null) => {
    setPreviewUrl(url);
    updateDetails({ uploadedImage: url });
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
    const isValid = await validateStep();
    
    if (isValid) {
      const formValues = form.getValues();
      
      if (state.step === 1) {
        updateBasics({
          store_name: formValues.store_name,
          name: formValues.name,
          phone: formValues.phone,
        });
      } else if (state.step === 2) {
        updateDetails({ bio: formValues.bio });
      } else if (state.step === 3) {
        updateSocial({
          instagram_link: formValues.instagram_link,
          facebook_link: formValues.facebook_link,
          wabusiness_link: formValues.wabusiness_link,
        });
      }
      
      setTimeout(() => {
        setStep(state.step + 1);
      }, 100);
    } else {
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
    if (!user) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    if (!state.formData.payout) {
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

      const currentFormValues = form.getValues();

      if (!state.formData.basics.store_name || !state.formData.basics.name || !state.formData.details.bio) {
        const fallbackData = {
          store_name: currentFormValues.store_name || state.formData.basics.store_name,
          name: currentFormValues.name || state.formData.basics.name,
          bio: currentFormValues.bio || state.formData.details.bio,
        };
        
        if (!fallbackData.store_name || !fallbackData.name || !fallbackData.bio) {
          setError('submission', 'Missing required form data');
          return;
        }
      }
      
      const finalSubmissionData = {
        store_name: state.formData.basics.store_name || currentFormValues.store_name,
        name: state.formData.basics.name || currentFormValues.name,
        phone: state.formData.basics.phone || currentFormValues.phone,
        bio: state.formData.details.bio || currentFormValues.bio,
        instagram_url: state.formData.social.instagram_link || currentFormValues.instagram_link,
        facebook_url: state.formData.social.facebook_link || currentFormValues.facebook_link,
        wabusiness_url: state.formData.social.wabusiness_link || currentFormValues.wabusiness_link,
      };
      
      if (!finalSubmissionData.store_name || !finalSubmissionData.name || !finalSubmissionData.bio) {
        setError('submission', 'Missing required form data');
        return;
      }

      const payoutInfo = state.formData.payout;

      const subaccountResult = await paystackClient.createSubaccount({
        business_name: finalSubmissionData.store_name,
        bank_code: payoutInfo.bank_code,
        account_number: payoutInfo.account_number,
        percentage_charge: 2
      });

      const payout_info_payload = {
        ...payoutInfo,
        subaccount_code: subaccountResult.subaccount_code
      };

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

      completeOnboarding();
      clearState();
      
      toast({
        title: 'Onboarding Complete',
        description: 'Your store profile has been successfully set up and verified.',
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
      
      console.error('[Onboarding] Error during completion:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm p-4">
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
          
          <div className="bg-card rounded-xl shadow-lg p-8">
            <div className="flex mb-8 justify-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${state.step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <div className={`w-16 h-1 ${state.step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  3
                </div>
                <div className={`w-16 h-1 ${state.step >= 4 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.step >= 4 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
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
                              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
                              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
                              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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
        <SupportChat variant="inline" className="mt-8" />
      </div>
      <SupportChat variant="floating" />
    </div>
  );
};

export default VendorOnboarding;
