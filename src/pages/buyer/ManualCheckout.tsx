// src/pages/buyer/ManualCheckout.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuyerStore } from '@/stores';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Clock, ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import BankDetailsDisplay from '@/components/buyer/BankDetailsDisplay';
import PaymentProofUpload from '@/components/buyer/PaymentProofUpload';
import { createOrderWithPaymentProof, getVendorBySlug } from '@/services/buyerStorefrontService';

interface DeliveryInfo {
  name: string;
  phone: string;
  email: string;
  pickup_location: string;
}

const ManualCheckout: React.FC = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart: items, getTotal, clearCart } = useBuyerStore();
  
  const [vendor, setVendor] = useState<any>(null);
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    name: '',
    phone: '',
    email: '',
    pickup_location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentProofFiles, setPaymentProofFiles] = useState<File[]>([]);
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  // Load vendor information
  useEffect(() => {
    const loadVendor = async () => {
      if (!vendorSlug) return;
      try {
        const vendorData = await getVendorBySlug(vendorSlug);
        setVendor(vendorData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load vendor information',
          variant: 'destructive',
        });
        navigate(`/store/${vendorSlug}`);
      }
    };
    loadVendor();
  }, [vendorSlug, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDelivery({ ...delivery, [e.target.name]: e.target.value });
  };

  const handleProofsChange = (files: File[], reference: string, additionalNotes: string) => {
    setPaymentProofFiles(files);
    setTransactionReference(reference);
    setNotes(additionalNotes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    // Validation
    if (!delivery.name || !delivery.phone || !delivery.email || !delivery.pickup_location) {
      setFormError('Please fill in all delivery information fields');
      setSubmitting(false);
      return;
    }

    if (!transactionReference) {
      setFormError('Please enter your transaction reference number');
      setSubmitting(false);
      return;
    }

    if (paymentProofFiles.length === 0) {
      setFormError('Please upload at least one payment proof image');
      setSubmitting(false);
      return;
    }

    try {
      if (!vendor) throw new Error('Vendor information not available');

      // Create order with manual payment details
        const orderPayload = {
          product_id: items[0]?.id || '', // Required for backward compatibility
          vendor_id: vendor.user_id,
          status: 'payment_pending' as const,
          delivery_location: delivery.pickup_location,
          total_amount: getTotal(),
        customer_info: {
          name: delivery.name,
          phone: delivery.phone,
          email: delivery.email,
          address: delivery.pickup_location,
        },
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size || '',
          color: item.color || '',
        })),
        // Manual payment fields
        transaction_reference: transactionReference,
        payment_status: 'pending' as const,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        notes: notes,
      };

      const order = await createOrderWithPaymentProof(orderPayload, paymentProofFiles);
      
      // Clear cart and redirect to confirmation
      clearCart();
      navigate(`/store/${vendorSlug}/confirmation?orderId=${order.id}&payment=pending`);
      
    } catch (err: any) {
      setFormError(err.message || 'Failed to process order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalAmount = getTotal();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/store/${vendorSlug}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Button>
          <h1 className="text-2xl font-bold">Complete Your Order</h1>
          <p className="text-muted-foreground">
            Pay via bank transfer to {vendor.store_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Form */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
                <CardDescription>
                  Provide your contact and delivery details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={delivery.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={delivery.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={delivery.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_location">Delivery Address *</Label>
                  <Textarea
                    id="pickup_location"
                    name="pickup_location"
                    value={delivery.pickup_location}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof Upload */}
            <PaymentProofUpload
              onProofsChange={handleProofsChange}
              orderId={`temp-${Date.now()}`}
              totalAmount={totalAmount}
            />
          </div>

          {/* Right Column - Bank Details & Order Summary */}
          <div className="space-y-6">
            {/* Bank Details */}
            {vendor.payout_info && (
              <BankDetailsDisplay
                bankDetails={vendor.payout_info}
                storeName={vendor.store_name}
              />
            )}

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.size && <>Size: {item.size} </>}
                          {item.color && <>Color: {item.color}</>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div>₦{item.price.toLocaleString()} x {item.quantity}</div>
                        <div className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Clock className="h-5 w-5" />
                  Payment Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-800">
                <ol className="space-y-2 text-sm">
                  <li>1. Transfer <strong>₦{totalAmount.toLocaleString()}</strong> to the bank account above</li>
                  <li>2. Use your transaction reference as the transfer reference</li>
                  <li>3. Upload payment proof screenshots</li>
                  <li>4. Your order will be verified within 24 hours</li>
                </ol>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{formError}</span>
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Place Order (₦{totalAmount.toLocaleString()})
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCheckout;
