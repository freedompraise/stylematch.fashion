import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getOrderById, getVendorBySlug } from '@/services/buyerStorefrontService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ExternalLink, Package, Clock, MapPin, Phone, Mail, Calendar } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const StoreConfirmation: React.FC = () => {
  const { vendorSlug } = useParams();
  const query = useQuery();
  const orderId = query.get('orderId');
  const whatsappUrl = query.get('whatsapp');
  
  // Debug: Log the WhatsApp URL received
  console.log('WhatsApp URL from URL params:', whatsappUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId || !vendorSlug) {
      setError('No order found.');
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Load order data first
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
        
        // Only fetch vendor data if WhatsApp URL is not provided (need to generate it)
        if (!whatsappUrl) {
          const vendorData = await getVendorBySlug(vendorSlug);
          setVendor(vendorData);
        }
      } catch (err: any) {
        setError(err.message || 'Order not found.');
      }
      setLoading(false);
    })();
  }, [orderId, vendorSlug, whatsappUrl]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'confirmed': return 'bg-success/10 text-success';
      case 'processing': return 'bg-primary/10 text-primary';
      case 'delivered': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12">
      <div className="bg-background rounded-lg shadow p-8 max-w-lg w-full text-center">
        {/* Success Header */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
            <Package className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank you for your order!</h1>
          <p className="text-muted-foreground mb-4">Your order has been received and confirmed.</p>
        </div>

        {/* Order Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Order ID</span>
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{order.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="font-semibold">{formatCurrency(order.total_amount || 0)}</span>
          </div>
        </div>

        {/* Email Notification Info */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            📧 An email notification has been sent to the vendor. They will reply soon with next steps.
          </p>
        </div>

        {/* WhatsApp Notification */}
        {(whatsappUrl || (vendor?.wabusiness_url)) && (
          <div className="mb-6 p-4 bg-success/5 border border-success/20 rounded-lg">
            <p className="text-sm text-success mb-3">
              Want to contact the vendor directly about your order?
            </p>
            <Button 
              onClick={() => {
                const url = whatsappUrl || vendor?.wabusiness_url;
                console.log('WhatsApp URL being used:', url);
                if (url) window.open(url, '_blank');
              }}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send WhatsApp Message
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate(`/store/${vendorSlug}/track?orderId=${order.id}`)}
            className="w-full"
          >
            Track This Order
          </Button>
          <Button 
            onClick={() => navigate(`/store/${vendorSlug}`)}
            className="w-full"
            variant="outline"
          >
            Continue Shopping
          </Button>
          {/* <Button 
            onClick={() => navigate('/')}
            className="w-full"
            variant="ghost"
          >
            Back to Home
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default StoreConfirmation; 