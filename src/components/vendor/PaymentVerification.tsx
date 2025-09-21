// src/components/vendor/PaymentVerification.tsx

import React, { useState } from 'react';
import { Order } from '@/types/OrderSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/lib/toast';

interface PaymentVerificationProps {
  order: Order;
  onVerifyPayment: (orderId: string, status: 'verified' | 'rejected') => Promise<void>;
  onVerificationComplete: () => void;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({ 
  order, 
  onVerifyPayment, 
  onVerificationComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyPayment = async (status: 'verified' | 'rejected') => {
    setVerifying(true);
    try {
      await onVerifyPayment(order.id, status);
      
      toast.success({
        title: status === 'verified' ? 'Payment Verified' : 'Payment Rejected',
        description: status === 'verified' 
          ? 'Order has been confirmed and will be processed'
          : 'Payment has been rejected. Customer will be notified.',
      });

      setIsOpen(false);
      onVerificationComplete();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error({
        title: 'Error',
        description: 'Failed to verify payment. Please try again.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const isExpired = order.expires_at && new Date(order.expires_at) < new Date();
  const timeRemaining = order.expires_at ? formatDistanceToNow(new Date(order.expires_at), { addSuffix: true }) : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Verify Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Verification - Order #{order.id.slice(-8)}
          </DialogTitle>
          <DialogDescription>
            Review payment proof and verify the bank transfer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {order.customer_info?.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {order.customer_info?.phone}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {order.customer_info?.email}
                </div>
                <div>
                  <span className="font-medium">Amount:</span> ₦{order.total_amount?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {getPaymentStatusBadge(order.payment_status || 'pending')}
                </div>
                <div>
                  <span className="font-medium">Order Date:</span> {new Date(order.created_at || '').toLocaleDateString()}
                </div>
              </div>
              
              {order.transaction_reference && (
                <div className="p-3 bg-muted rounded-lg">
                  <span className="font-medium">Transaction Reference:</span>
                  <span className="font-mono ml-2">{order.transaction_reference}</span>
                </div>
              )}

              {order.notes && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-medium text-blue-800">Customer Notes:</span>
                  <p className="text-blue-700 text-sm mt-1">{order.notes}</p>
                </div>
              )}

              {isExpired && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Order Expired</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    This order has expired and should be cancelled.
                  </p>
                </div>
              )}

              {timeRemaining && !isExpired && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Expires {timeRemaining}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Proof Images */}
          {order.payment_proof_urls && order.payment_proof_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Proof Images</CardTitle>
                <CardDescription>
                  Customer uploaded {order.payment_proof_urls.length} proof image(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.payment_proof_urls.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={url}
                        alt={`Payment proof ${index + 1}`}
                        className="w-full h-64 object-contain border rounded-lg bg-gray-50"
                        onClick={() => window.open(url, '_blank')}
                        style={{ cursor: 'pointer' }}
                      />
                      <p className="text-sm text-muted-foreground text-center">
                        Proof {index + 1} - Click to view full size
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Actions</CardTitle>
              <CardDescription>
                Review the payment proof and choose your action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleVerifyPayment('verified')}
                  disabled={verifying || isExpired}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {verifying ? 'Verifying...' : 'Verify Payment'}
                </Button>
                <Button
                  onClick={() => handleVerifyPayment('rejected')}
                  disabled={verifying}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {verifying ? 'Rejecting...' : 'Reject Payment'}
                </Button>
              </div>
              
              {isExpired && (
                <p className="text-sm text-muted-foreground mt-2">
                  This order has expired. Please reject the payment and inform the customer.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentVerification;
