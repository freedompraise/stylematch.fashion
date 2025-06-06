import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Instagram, Facebook, MessageCircle, Banknote, Upload } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';
import { useVendorData } from '@/services/vendorDataService';
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
import { useToast } from '@/hooks/use-toast';
import { OnboardingFormValues } from '@/types';
import Logo from '@/components/Logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const onboardingSchema = z.object({
  bio: z.string().min(10, { message: 'Bio should be at least 10 characters' }),
  instagram_link: z.string().optional(),
  facebook_link: z.string().optional(),
  wabusiness_link: z.string().optional(),
  bank_name: z.string().min(2, { message: 'Bank name is required' }),
  bank_code: z.string().min(2, { message: 'Bank code is required' }),
  account_number: z.string().min(10, { message: 'Valid account number required' }),
  account_name: z.string().min(2, { message: 'Account name is required' }),
  payout_mode: z.enum(['automatic', 'manual']).default('automatic'),
  store_image: z.any().optional(),
});

const VendorOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [resolvedAccountName, setResolvedAccountName] = useState('');  const [resolving, setResolving] = useState(false);
  const navigate = useNavigate();
  const { user, refreshVendor } = useVendor();
  const { getVendorProfile, updateVendorProfile } = useVendorData();

  const form = useForm<OnboardingFormValues & { bank_code: string; payout_mode: 'automatic' | 'manual' }>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: '',
      instagram_link: '',
      facebook_link: '',
      wabusiness_link: '',
      bank_name: '',
      bank_code: '',
      account_number: '',
      account_name: '',
      payout_mode: 'automatic',
    },
  });

  // Fetch banks from Paystack edge function
  useEffect(() => {
    fetch('https://wtzvuiltqqajgyzzdcal.supabase.co/functions/v1/paystack-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ action: 'list_banks' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status && data.data) setBanks(data.data);
      });
  }, []);
  // Load existing vendor data if available
  useEffect(() => {
    const loadVendorData = async () => {
      if (!user) return;
      try {
        const data = await getVendorProfile(user.id);
        if (data) {
          form.setValue('bio', data.bio || '');
          form.setValue('instagram_link', data.instagram_url || '');
          form.setValue('facebook_link', data.facebook_url || '');
          form.setValue('wabusiness_link', data.wabusiness_url || '');
          if (data.payout_info) {
            form.setValue('bank_name', data.payout_info.bank_name || '');
            form.setValue('bank_code', data.payout_info.bank_code || '');
            form.setValue('account_number', data.payout_info.account_number || '');
            form.setValue('account_name', data.payout_info.account_name || '');
            form.setValue('payout_mode', data.payout_info.payout_mode === 'manual' ? 'manual' : 'automatic');
            setResolvedAccountName(data.payout_info.account_name || '');
          }
          if (data.banner_image_url) {
            setUploadedImage(data.banner_image_url);
          }
        }
      } catch (error) {
        console.error('Error loading vendor data:', error);
      }
    };    loadVendorData();
  }, [user, getVendorProfile, form]);

  // Resolve account name when bank_code and account_number are filled
  const resolveAccountName = async (bank_code: string, account_number: string) => {
    if (!bank_code || !account_number || account_number.length !== 10) return;
    setResolving(true);
    try {
      const response = await fetch('https://wtzvuiltqqajgyzzdcal.supabase.co/functions/v1/paystack-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'resolve_account',
          data: { bank_code, account_number }
        })
      });
      const result = await response.json();
      if (result.status && result.data && result.data.account_name) {
        setResolvedAccountName(result.data.account_name);
        form.setValue('account_name', result.data.account_name);
      } else {
        setResolvedAccountName('');
        form.setValue('account_name', '');
      }
    } catch {
      setResolvedAccountName('');
      form.setValue('account_name', '');
    } finally {
      setResolving(false);
    }
  };
  const onSubmit = async (data: OnboardingFormValues & { bank_code: string; payout_mode: 'automatic' | 'manual' }) => {
    if (!user) {
      toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
      return;
    }

    try {
      setIsLoading(true);
      // Create recipient via edge function
      const response = await fetch('https://wtzvuiltqqajgyzzdcal.supabase.co/functions/v1/paystack-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'create_recipient',
          data: {
            account_number: data.account_number,
            bank_code: data.bank_code,
            account_name: data.account_name,
            payout_mode: data.payout_mode,
          }
        })
      });
      const result = await response.json();      if (!result.status || result.status !== true) {
        throw new Error(result.message || 'Failed to create recipient');
      }
      await updateVendorProfile(
        user.id,
        {
          bio: data.bio,
          instagram_url: data.instagram_link,
          facebook_url: data.facebook_link,
          wabusiness_url: data.wabusiness_link,
          payout_info: {
            bank_name: banks.find(b => b.code === data.bank_code)?.name || data.bank_name,
            bank_code: data.bank_code,
            account_number: data.account_number,
            account_name: data.account_name,
            recipient_code: result.data.recipient_code,
            payout_mode: data.payout_mode,
          },
        },
        data.store_image?.[0]
      );

      toast({
        title: 'Onboarding Complete',
        description: 'Your store profile has been successfully set up.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        const fileList = dataTransfer.files;
        form.setValue('store_image', fileList);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = async () => {
    if (step === 1) {
      return await form.trigger(['bio', 'store_image']);
    } else if (step === 2) {
      return await form.trigger(['instagram_link', 'facebook_link', 'wabusiness_link']);
    } else if (step === 3) {
      return await form.trigger(['bank_name', 'bank_code', 'account_number', 'account_name', 'payout_mode']);
    }
    return true;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setStep((prevStep) => prevStep + 1);
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      })
    }
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => prevStep - 1);
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
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-baseContent">Store Details</h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-baseContent mb-2">
                        Store Logo
                      </label>
                      <div className="flex items-center space-x-6">
                        <div className="relative overflow-hidden w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          {uploadedImage ? (
                            <img 
                              src={uploadedImage} 
                              alt="Store logo" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Upload className="text-gray-400" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="text-sm text-baseContent-secondary">
                          Upload your store logo or brand icon
                        </div>
                      </div>
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
                    
                    <div className="pt-4 flex justify-end">
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

                {step === 2 && (
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

                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-semibold text-baseContent">Payout Information</h2>
                    <p className="text-baseContent-secondary text-sm">
                      Set up how you'd like to receive payments from your sales
                    </p>
                    <FormField
                      control={form.control}
                      name="payout_mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payout Mode</FormLabel>
                          <FormControl>
                            <select {...field} className="input">
                              <option value="automatic">Automatic</option>
                              <option value="manual">Manual</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bank_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="input"
                              onChange={async (e) => {
                                field.onChange(e);
                                const bank = banks.find(b => b.code === e.target.value);
                                form.setValue('bank_name', bank?.name || '');
                                if (form.getValues('account_number').length === 10) {
                                  await resolveAccountName(e.target.value, form.getValues('account_number'));
                                }
                              }}
                              value={form.watch('bank_code')}
                            >
                              <option value="">Select Bank</option>
                              {banks.map((bank) => (
                                <option key={bank.code} value={bank.code}>{bank.name}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              maxLength={10}
                              onBlur={async (e) => {
                                if (form.getValues('bank_code') && e.target.value.length === 10) {
                                  await resolveAccountName(form.getValues('bank_code'), e.target.value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="account_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly value={resolvedAccountName} />
                          </FormControl>
                          {resolving && <div className="text-xs text-gray-500">Resolving account name...</div>}
                          {!resolving && resolvedAccountName && (
                            <div className="mt-1 text-green-700 text-sm">Account Name: <strong>{resolvedAccountName}</strong></div>
                          )}
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
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Complete Setup'}
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
