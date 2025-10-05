import React, { useState, useEffect } from 'react';
import { useVendorStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Download, User, Phone, Mail, MapPin, Calendar, Package } from 'lucide-react';
import CheckMailGuide from '@/components/CheckMailGuide';
import { Order, OrderStatus } from '@/types/OrderSchema';
import { toast } from '@/lib/toast';
import PaymentVerification from '@/components/vendor/PaymentVerification';
// using existing Dialog imports from above

const OrderManagement: React.FC = () => {
  const { 
    orders, 
    setOrders, 
    updateOrderStatus: updateOrderInStore, 
    removeOrder, 
    fetchOrders, 
    deleteOrder: deleteOrderFromStore,
    ordersLoaded
  } = useVendorStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Order | null>(null);
  const [showEmailGuide, setShowEmailGuide] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        console.log('[OrderManagement] Loading orders...', { 
          ordersLoaded, 
          currentOrdersCount: orders.length 
        });
        
        await fetchOrders(true); // use cache
        console.log('[OrderManagement] Orders loaded successfully');
      } catch (error) {
        if (mounted) {
          console.error('[OrderManagement] Error loading orders:', error);
          toast.orders.loadError();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchOrders]);


  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderInStore(orderId, newStatus);
      toast.orders.updateSuccess();
    } catch (error) {
      toast.orders.updateError();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await deleteOrderFromStore(orderId);
      toast.orders.deleteSuccess();
    } catch (error) {
      toast.orders.deleteError();
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Order flow configuration - defines the natural progression of orders
  const getOrderFlow = (currentStatus: OrderStatus) => {
    const flow: Record<OrderStatus, { next: OrderStatus[], label: string, color: string, variant: string }> = {
      pending: { 
        next: ['confirmed', 'cancelled'], // Can verify payment or cancel
        label: 'Awaiting Payment Verification', 
        color: 'bg-yellow-100 text-yellow-800', 
        variant: 'secondary' 
      },
      confirmed: { 
        next: ['processing', 'cancelled'], 
        label: 'Confirmed', 
        color: 'bg-green-100 text-green-800', 
        variant: 'default' 
      },
      processing: { 
        next: ['delivered'], 
        label: 'Processing', 
        color: 'bg-purple-100 text-purple-800', 
        variant: 'default' 
      },
      delivered: { 
        next: [], 
        label: 'Delivered', 
        color: 'bg-green-100 text-green-800', 
        variant: 'default' 
      },
      cancelled: { 
        next: [], 
        label: 'Cancelled', 
        color: 'bg-red-100 text-red-800', 
        variant: 'destructive' 
      },
    };
    return flow[currentStatus];
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    return getOrderFlow(status).variant;
  };

  const getStatusColor = (status: OrderStatus) => {
    return getOrderFlow(status).color;
  };

  const getStatusLabel = (status: OrderStatus) => {
    return getOrderFlow(status).label;
  };

  const getNextActions = (status: OrderStatus) => {
    return getOrderFlow(status).next;
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <CheckMailGuide show={showEmailGuide} onDismiss={() => setShowEmailGuide(false)} />

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
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Awaiting Payment Verification</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
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
                    <TableCell>
                      <button
                        onClick={() => setSelectedCustomer(order)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        title="Click to view customer details"
                      >
                        {order.customer_info?.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        // Handle multiple items case
                        if (order.items && order.items.length > 0) {
                          if (order.items.length === 1) {
                            // Single item
                            const item = order.items[0];
                            return (
                              <span className="font-medium">
                                {item.product_name} (×{item.quantity})
                              </span>
                            );
                          } else {
                            // Multiple items
                            return (
                              <div className="space-y-1">
                                <span className="text-sm font-medium">
                                  {order.items.length} item(s)
                                </span>
                                <div className="text-xs text-muted-foreground">
                                  {order.items.slice(0, 2).map((item, index) => (
                                    <div key={index}>
                                      {item.product_name} (×{item.quantity})
                                    </div>
                                  ))}
                                  {order.items.length > 2 && (
                                    <div>+{order.items.length - 2} more...</div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        }
                        
                        // Handle single product case (legacy)
                        return (
                          <span className="font-medium">
                            {order.product_name}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>₦{order.total_amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status) as "default" | "destructive" | "secondary" | "outline"} className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                          {/* Special handling for pending orders with payment proof */}
                          {order.status === 'pending' && 
                           order.payment_proof_urls && 
                           order.payment_proof_urls.length > 0 ? (
                            // Show Payment Verification component for orders with payment proof
                            <PaymentVerification 
                              order={order} 
                              onVerifyPayment={async (orderId, status) => {
                                await updateOrderInStore(orderId, status === 'verified' ? 'confirmed' : 'cancelled');
                              }}
                              onVerificationComplete={() => {
                                // Refresh orders after verification
                                fetchOrders(false);
                              }} 
                            />
                          ) : (
                            // Show flow-based action buttons for all other cases
                            <>
                              {getNextActions(order.status).map((nextStatus) => (
                                <Button
                                  key={nextStatus}
                                  variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                  className={
                                    nextStatus === 'cancelled' 
                                      ? 'bg-red-600 hover:bg-red-700' 
                                      : nextStatus === 'confirmed'
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : ''
                                  }
                                >
                                  {nextStatus === 'confirmed' && 'Verify Payment'}
                                  {nextStatus === 'processing' && 'Start Processing'}
                                  {nextStatus === 'delivered' && 'Mark Delivered'}
                                  {nextStatus === 'cancelled' && 'Cancel Order'}
                                </Button>
                              ))}
                            </>
                          )}
                          
                          {/* Show info for different order states */}
                          {order.status === 'pending' && (
                            <span className="text-sm text-muted-foreground">
                              Waiting for payment proof
                            </span>
                          )}
                          {order.status === 'pending' && 
                           (!order.payment_proof_urls || order.payment_proof_urls.length === 0) && (
                            <span className="text-sm text-muted-foreground">
                              No payment proof uploaded
                            </span>
                          )}
                          {(order.status === 'delivered' || order.status === 'cancelled') && (
                            <span className="text-sm text-muted-foreground">
                              {order.status === 'delivered' ? 'Order delivered' : 'Order cancelled'}
                            </span>
                          )}
                          
                          {/* Show delete button for all orders except delivered ones */}
                          {order.status !== 'delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
      )}

      {/* Customer Details Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the customer and their order
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.customer_info?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.customer_info?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.customer_info?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.customer_info?.address}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Order Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedCustomer.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Delivery Location</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.delivery_location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Total Amount</p>
                        <p className="text-sm text-muted-foreground">₦{selectedCustomer.total_amount?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(selectedCustomer.status) as "default" | "destructive" | "secondary" | "outline"} className={getStatusColor(selectedCustomer.status)}>
                        {getStatusLabel(selectedCustomer.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              {selectedCustomer.items && selectedCustomer.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order Items ({selectedCustomer.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCustomer.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Quantity: {item.quantity}</span>
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₦{item.price?.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Information */}
              {(selectedCustomer.payment_proof_urls || selectedCustomer.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedCustomer.payment_proof_urls && selectedCustomer.payment_proof_urls.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Payment Proof Images</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {selectedCustomer.payment_proof_urls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Payment proof ${index + 1}`}
                              className="w-full h-32 object-cover border rounded-lg cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCustomer.notes && (
                      <div>
                        <p className="text-sm font-medium">Customer Notes</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Guide handled within CheckMailGuide */}
    </div>
  );
};

export default OrderManagement;
