
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderStatus } from '@/types/OrderSchema';
import { ShoppingCart } from 'lucide-react';

interface RecentOrdersProps {
  orders: Order[];
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600';
    case 'completed':
    case 'delivered':
      return 'text-green-600';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
  }
};

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">When customers place orders, they'll appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.customer_info.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">₦{order.total_amount.toFixed(2)}</p>
                <p className={`text-sm ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders; 
