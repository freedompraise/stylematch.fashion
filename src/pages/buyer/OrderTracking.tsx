// src/pages/buyer/OrderTracking.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '@/services/buyerStorefrontService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Clock, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const { vendorSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);

  // Auto-load order if orderId is provided in URL
  useEffect(() => {
    if (orderId) {
      handleTrackOrder();
    }
  }, []);

  const handleTrackOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await getOrderById(orderId.trim());
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check your order ID.');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Order submitted, awaiting payment verification';
      case 'confirmed': return 'Payment verified, order confirmed and being prepared';
      case 'processing': return 'Your order is being processed';
      case 'delivered': return 'Order has been delivered';
      case 'cancelled': return 'Order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order ID to check the status of your order</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Track Order
            </CardTitle>
            <CardDescription>
              Enter your order ID to view order details and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter your order ID (e.g., 172d5acd-e2ea-4f0b-ba21-760a539256c4)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Track Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-error/20 bg-error/5">
            <CardContent className="pt-6">
              <p className="text-error">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge className={`${getStatusColor(order.status)} text-lg px-4 py-2`}>
                      {order.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-muted-foreground mt-2">{getStatusDescription(order.status)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">{order.created_at ? formatDate(order.created_at) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">{formatCurrency(order.total_amount || 0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                            {item.size && ` • Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                          </p>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Information */}
            {order.customer_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Name</span>
                    <p className="font-medium">{order.customer_info.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <p className="font-medium">{order.customer_info.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email</span>
                    <p className="font-medium">{order.customer_info.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Delivery Location</span>
                    <p className="font-medium">{order.delivery_location}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information
            {order.payment_status && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Status</span>
                    <Badge className={getStatusColor(order.payment_status)}>
                      {order.payment_status?.toUpperCase()}
                    </Badge>
                  </div>
                  {order.transaction_reference && (
                    <div>
                      <span className="text-sm text-muted-foreground">Transaction Reference</span>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{order.transaction_reference}</p>
                    </div>
                  )}
                  {order.expires_at && (
                    <div>
                      <span className="text-sm text-muted-foreground">Payment Expires</span>
                      <p className="text-sm">{formatDate(order.expires_at)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )} */}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {vendorSlug && (
                <Button 
                  onClick={() => navigate(`/store/${vendorSlug}`)}
                  variant="outline"
                >
                  Back to Store
                </Button>
              )}
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
