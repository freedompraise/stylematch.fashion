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
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { toast } from '@/lib/toast';
// import { PayoutForm, defaultInitialData } from '@/components/vendor/PayoutForm';
import { PayoutFormData } from '@/types';
import { StoreImageUpload } from '@/components/vendor/StoreImageUpload';
import SupportChat from '@/components/SupportChat';
import { getBanks, Bank } from '@/constants/banks';

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
  wabusiness_link: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field
      // Accept both wa.me and https://wa.me formats
      const waMeRegex = /^(https?:\/\/)?wa\.me\/[\d\w\-\.]+$/i;
      return waMeRegex.test(val);
    }, {
      message: 'Please enter a valid WhatsApp Business link (e.g., wa.me/1234567890 or https://wa.me/1234567890)'
    }),
});

// Makeshift payout form schema for manual entry - matches PayoutFormData interface
const makeshiftPayoutSchema = z.object({
  payout_mode: z.enum(['automatic', 'manual'], { required_error: 'Payout mode is required' }),
  bank_name: z.string().min(1, 'Bank name is required'),
  bank_code: z.string().min(1, 'Bank code is required'),
  account_number: z.string().min(10, 'Account number must be 10 digits').max(10, 'Account number must be 10 digits'),
  account_name: z.string().min(1, 'Account name is required'),
});

const VendorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
const { createVendorProfile, completeOnboarding } = useVendorStore();
  const [banks, setBanks] = useState<Bank[]>([]);
  
  // Makeshift payout form state (separate from main form)
  const [makeshiftPayoutData, setMakeshiftPayoutData] = useState({
    payout_mode: 'automatic' as 'automatic' | 'manual',
    bank_name: '',
    bank_code: '',
    account_number: '',
    account_name: '',
  });
  
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
      state.step === 3 ? socialSchema :
      z.object({}) // No validation for step 4 - handled by makeshift form
    ),
    defaultValues: {
      store_name: '',
      name: '',
      phone: '',
      bio: '',
      instagram_link: '',
      facebook_link: '',
      wabusiness_link: '',
      payout_mode: '',
      bank_name: '',
      bank_code: '',
      account_number: '',
      account_name: '',
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
    // Step 4 uses separate makeshift form state - no form sync needed
  }, [state.step]);

  // Load banks using utility function
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const bankList = await getBanks();
        setBanks(bankList);
      } catch (error) {
        console.error('[VendorOnboarding] Error loading banks:', error);
        // Banks utility will handle fallback to dummy data
      }
    };
    loadBanks();
  }, []);

  // Sync makeshift payout form with onboarding state
  useEffect(() => {
    if (state.formData.payout) {
      setMakeshiftPayoutData({
        payout_mode: state.formData.payout.payout_mode || 'automatic',
        bank_name: state.formData.payout.bank_name || '',
        bank_code: state.formData.payout.bank_code || '',
        account_number: state.formData.payout.account_number || '',
        account_name: state.formData.payout.account_name || '',
      });
    }
  }, [state.formData.payout]);

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

  // Removed handleResolveAccount - using manual entry instead

  const validateStep = async () => {
    if (state.step === 1) {
      return await form.trigger(['store_name', 'name', 'phone']);
    } else if (state.step === 2) {
      return await form.trigger(['bio']);
    } else if (state.step === 3) {
      return await form.trigger(['instagram_link', 'facebook_link', 'wabusiness_link']);
    } else if (state.step === 4) {
      // Validate makeshift payout form data
      try {
        // Check if all required fields are filled
        const isValid = makeshiftPayoutData.payout_mode && 
                       makeshiftPayoutData.bank_name && 
                       makeshiftPayoutData.bank_code && 
                       makeshiftPayoutData.account_number && 
                       makeshiftPayoutData.account_name;
        
        if (!isValid) {
          console.log('Makeshift form validation failed:', makeshiftPayoutData);
          return false;
        }
        
        makeshiftPayoutSchema.parse(makeshiftPayoutData);
        return true;
      } catch (error) {
        console.log('Makeshift form schema validation failed:', error, makeshiftPayoutData);
        return false;
      }
    }
    return true;
  };

  // Helper function to normalize WhatsApp links
  const normalizeWhatsAppLink = (link: string): string => {
    if (!link) return link;
    // If it starts with wa.me but doesn't have https://, add it
    if (link.startsWith('wa.me/') && !link.startsWith('http')) {
      return `https://${link}`;
    }
    return link;
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
        // Normalize WhatsApp link before saving
        updateSocial({
          instagram_link: formValues.instagram_link,
          facebook_link: formValues.facebook_link,
          wabusiness_link: normalizeWhatsAppLink(formValues.wabusiness_link || ''),
        });
      } else if (state.step === 4) {
        updatePayout({
          payout_mode: makeshiftPayoutData.payout_mode,
          bank_name: makeshiftPayoutData.bank_name,
          bank_code: makeshiftPayoutData.bank_code,
          account_number: makeshiftPayoutData.account_number,
          account_name: makeshiftPayoutData.account_name,
        });
      }
      
      setTimeout(() => {
        setStep(state.step + 1);
      }, 100);
    } else {
      toast.form.validationError();
    }
  };

  const handlePreviousStep = () => {
    setStep(state.step - 1);
  };

  // Removed handlePayoutChange - using form validation instead

  const handleCompleteOnboarding = async () => {
    if (!user) {
      toast.auth.userNotFound();
      return;
    }

    // Check makeshift form data instead of state.formData.payout
    if (!makeshiftPayoutData.payout_mode || !makeshiftPayoutData.bank_name || !makeshiftPayoutData.bank_code || !makeshiftPayoutData.account_number || !makeshiftPayoutData.account_name) {
      toast.payouts.missingInfo();
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

      // Use makeshift form data instead of state.formData.payout
      const payoutInfo = makeshiftPayoutData;

      // Store payout info without creating subaccount yet
      // Subaccount will be created when vendor makes their first sale or when explicitly requested
      // This prevents unnecessary subaccount creation for vendors who don't make sales
      const payout_info_payload = {
        ...payoutInfo,
        subaccount_created: false,
        subaccount_code: null
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
      
      toast.store.onboardingSuccess();
      
      navigate('/vendor/dashboard', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      setError('submission', errorMessage);
      
      toast.store.onboardingError();
      
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
                                placeholder="wa.me/1234567890"
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
                      {/* 
                        MAKESHIFT PAYOUT FORM - Manual Entry Only
                        This is a temporary solution while Paystack test mode has daily limits.
                        The original PayoutForm with account resolution is commented out below.
                        TODO: Restore original PayoutForm once Paystack live mode is enabled.
                      */}
                      <div className="space-y-6">
                        <div>
                          <label className="block font-semibold mb-1 text-baseContent">Payout Mode</label>
                          <select 
                            value={makeshiftPayoutData.payout_mode}
                            onChange={(e) => setMakeshiftPayoutData(prev => ({ ...prev, payout_mode: e.target.value as 'automatic' | 'manual' }))}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-baseContent"
                            disabled={state.isSubmitting}
                          >
                            <option value="">Select Payout Mode</option>
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 text-baseContent">Bank</label>
                          <select
                            value={makeshiftPayoutData.bank_code}
                            onChange={(e) => {
                              const code = e.target.value;
                              const bank = banks.find(b => b.code === code);
                              if (bank) {
                                setMakeshiftPayoutData(prev => ({ 
                                  ...prev, 
                                  bank_code: code,
                                  bank_name: bank.name 
                                }));
                              }
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-baseContent"
                            disabled={state.isSubmitting}
                          >
                            <option value="">Select Bank</option>
                            {banks.map(bank => (
                              <option key={bank.code} value={bank.code} className="text-baseContent">
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 text-baseContent">Account Number</label>
                          <Input
                            value={makeshiftPayoutData.account_number}
                            onChange={(e) => setMakeshiftPayoutData(prev => ({ ...prev, account_number: e.target.value }))}
                            placeholder="Enter 10-digit account number"
                            maxLength={10}
                            disabled={state.isSubmitting}
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 text-baseContent">Account Name</label>
                          <Input
                            value={makeshiftPayoutData.account_name}
                            onChange={(e) => setMakeshiftPayoutData(prev => ({ ...prev, account_name: e.target.value }))}
                            placeholder="Enter account holder name"
                            disabled={state.isSubmitting}
                          />
                        </div>
                      </div>

                      {/* 
                        ORIGINAL PAYOUT FORM - COMMENTED OUT
                        TODO: Restore this once Paystack live mode is enabled
                      <PayoutForm
                        initialData={state.formData.payout || defaultInitialData}
                        onChange={handlePayoutChange}
                        banks={banks}
                        onResolveAccount={handleResolveAccount}
                        disabled={state.isSubmitting}
                      />
                      */}
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
