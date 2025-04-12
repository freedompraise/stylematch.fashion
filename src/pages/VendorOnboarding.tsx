
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Instagram, Facebook, Twitter, Banknote, Upload } from 'lucide-react';
import Logo from '@/components/Logo';

const onboardingSchema = z.object({
  bio: z.string().min(10, { message: 'Bio should be at least 10 characters' }),
  instagramLink: z.string().optional(),
  facebookLink: z.string().optional(),
  twitterLink: z.string().optional(),
  bankName: z.string().min(2, { message: 'Bank name is required' }),
  accountNumber: z.string().min(10, { message: 'Valid account number required' }),
  accountName: z.string().min(2, { message: 'Account name is required' }),
  storeImage: z.any().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const VendorOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      bio: '',
      instagramLink: '',
      facebookLink: '',
      twitterLink: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
    },
  });

  const onSubmit = (data: OnboardingFormValues) => {
    console.log('Onboarding data:', data);
    // This would be replaced with actual onboarding logic
    navigate('/dashboard');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
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
              <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        onClick={() => setStep(2)}
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
                      name="instagramLink"
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
                      name="facebookLink"
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
                      name="twitterLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter Profile</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <Input 
                                placeholder="https://twitter.com/yourstorename" 
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
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep(3)}
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
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Bank className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <Input 
                                placeholder="Your bank name" 
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
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your account number"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Name on account"
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
                        onClick={() => setStep(2)}
                      >
                        Back
                      </Button>
                      <Button type="submit">
                        Complete Setup
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
