import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuyerStore, useMarketplaceStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem } from '@/types';
import { createOrder, getVendorSubaccountBySlug } from '@/services/buyerStorefrontService';

interface DeliveryInfo {
  name: string;
  phone: string;
  email: string;
  method: 'pickup'; // extensible for delivery
  pickup_location: string;
}

const initialDelivery: DeliveryInfo = {
  name: '',
  phone: '',
  email: '',
  method: 'pickup',
  pickup_location: '',
};

const StoreCheckoutContent: React.FC<{ vendorSlug: string }> = ({ vendorSlug }) => {
  const { cart: items, getTotal, clearCart } = useBuyerStore();
  const { currentVendor: vendor, loading, error, fetchVendorData } = useMarketplaceStore();
  
  useEffect(() => {
    fetchVendorData(vendorSlug);
  }, [vendorSlug, fetchVendorData]);
  const [delivery, setDelivery] = useState<DeliveryInfo>(initialDelivery);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (vendor && vendor.store_name && !delivery.pickup_location) {
      setDelivery((prev) => ({ ...prev, pickup_location: vendor.store_name }));
    }
    // eslint-disable-next-line
  }, [vendor]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!vendor) return null;
  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate(`/store/${vendorSlug}`)}>Back to Store</Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDelivery({ ...delivery, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      // 1. Get vendor subaccount for Paystack split
      const subaccount_code = await getVendorSubaccountBySlug(vendorSlug);
      if (!subaccount_code) throw new Error('Vendor payout info not available.');
      // 2. Create order in Supabase
      const orderPayload = {
        vendor_id: vendor.user_id,
        status: 'pending',
        delivery_location: delivery.pickup_location,
        delivery_date: new Date().toISOString(),
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
        paystack_split: {
          subaccount: subaccount_code,
          percentage: 98,
        },
      };
      const order = await createOrder(orderPayload);
      // 3. Initialize Paystack payment (pseudo, replace with real integration)
      // TODO: Use Paystack JS SDK or redirect to payment page
      // For now, simulate payment success
      setTimeout(() => {
        setSubmitting(false);
        clearCart();
        navigate(`/store/${vendorSlug}/confirmation?orderId=${order.id}`);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to process order.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Delivery Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" placeholder="Full Name" value={delivery.name} onChange={handleChange} required />
            <Input name="phone" placeholder="Phone Number" value={delivery.phone} onChange={handleChange} required />
            <Input name="email" placeholder="Email Address" value={delivery.email} onChange={handleChange} required />
            <Input name="pickup_location" placeholder="Pickup Location (e.g. vendor's store)" value={delivery.pickup_location} onChange={handleChange} required />
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
          <div className="divide-y">
            {items.map((item: CartItem, idx) => (
              <div key={idx} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-baseContent-secondary">
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
          <div className="flex justify-between mt-4 text-lg font-bold">
            <span>Total</span>
            <span>₦{getTotal().toLocaleString()}</span>
          </div>
        </div>
        {formError && <div className="text-red-500 mb-4">{formError}</div>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Processing...' : 'Pay with Paystack'}
        </Button>
      </form>
    </div>
  );
};

const StoreCheckout: React.FC = () => {
  const { vendorSlug } = useParams();
  if (!vendorSlug) return <div>Invalid store URL</div>;
  return <StoreCheckoutContent vendorSlug={vendorSlug} />;
};

export default StoreCheckout; 