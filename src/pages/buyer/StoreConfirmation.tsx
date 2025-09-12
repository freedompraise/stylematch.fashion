import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getOrderById } from '@/services/buyerStorefrontService';
import { Button } from '@/components/ui/button';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const StoreConfirmation: React.FC = () => {
  const { vendorSlug } = useParams();
  const query = useQuery();
  const orderId = query.get('orderId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      setError('No order found.');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Order not found.');
      }
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12">
      <div className="bg-background rounded-lg shadow p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
        <p className="mb-2">Order ID: <span className="font-mono text-primary">{order.id}</span></p>
        <p className="mb-2">Status: <span className="font-semibold">{order.status}</span></p>
        <p className="mb-4">A confirmation has been sent to your email if payment was successful.</p>
        <Button onClick={() => navigate(`/store/${vendorSlug}`)}>Back to Store</Button>
      </div>
    </div>
  );
};

export default StoreConfirmation; 