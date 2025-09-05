import React, { useState, useEffect } from 'react';
import { useVendorStore } from '@/stores';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download } from 'lucide-react';
import { Order, OrderStatus } from '@/types/OrderSchema';

const OrderManagement: React.FC = () => {
  const { 
    orders, 
    setOrders, 
    updateOrder: updateOrderInStore, 
    removeOrder, 
    fetchOrders, 
    deleteOrder: deleteOrderFromStore,
    vendor,
    ordersLoaded
  } = useVendorStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        console.log('[OrderManagement] Loading orders...', { 
          vendorId: vendor?.user_id, 
          ordersLoaded, 
          currentOrdersCount: orders.length 
        });
        
        if (!vendor?.user_id) {
          console.error('[OrderManagement] No vendor ID available');
          toast({
            title: 'Error loading orders',
            description: 'Vendor profile not loaded. Please refresh the page.',
            variant: 'destructive',
          });
          return;
        }
        
        await fetchOrders(true); // use cache
        console.log('[OrderManagement] Orders loaded successfully');
      } catch (error) {
        console.error('[OrderManagement] Error loading orders:', error);
        toast({
          title: 'Error loading orders',
          description: 'Could not load your orders. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [fetchOrders, toast, vendor?.user_id, ordersLoaded]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderInStore(orderId, { status: newStatus });
      toast({
        title: 'Order updated',
        description: 'Order status has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error updating order',
        description: 'Could not update order status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await deleteOrderFromStore(orderId);
      toast({
        title: 'Order deleted',
        description: 'Order has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error deleting order',
        description: 'Could not delete order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'processing': return 'default';
      case 'processing': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
            type="search"
                placeholder="Search orders..."
            className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
        </div>
          </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No orders found</p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                Clear filters
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Orders will appear here once customers start placing them.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order List</CardTitle>
            <CardDescription>
              Manage and track your customer orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>{order.customer_info?.name}</TableCell>
                    <TableCell>{order.product_id}</TableCell>
                    <TableCell>₦{order.total_amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                      <div className="flex items-center gap-2">
                          <Select
                            value={order.status}
                          onValueChange={(value: OrderStatus) => handleStatusUpdate(order.id, value)}
                          >
                          <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default OrderManagement;
