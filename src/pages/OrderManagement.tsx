import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  Package,
  Truck,
  Check,
  X,
  Clock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { OrderStatus } from '@/types/OrderSchema';

const statusOptions = [
  'All Orders',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Completed',
  'Confirmed',
];

const OrderManagement: React.FC = () => {
  const { session } = useSession();
  const { orders, fetchOrders, updateOrder, deleteOrder } = useVendorData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchOrders(session.user.id);
    // eslint-disable-next-line
  }, [session?.user?.id, fetchOrders]);
  
  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.customer_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesStatus = selectedStatus === 'All Orders' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus as OrderStatus });
    } catch (e) {
      // handle error/toast
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} className="text-orange-500" />;
      case 'Processing':
        return <Package size={16} className="text-blue-500" />;
      case 'Shipped':
        return <Truck size={16} className="text-purple-500" />;
      case 'Delivered':
        return <Check size={16} className="text-green-500" />;
      case 'Cancelled':
        return <X size={16} className="text-red-500" />;
      case 'Confirmed':
        return <Check size={16} className="text-blue-500" />;
      case 'Completed':
        return <Check size={16} className="text-green-700" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-baseContent">Order Management</h1>
        <Button variant="outline">
          <Calendar size={18} className="mr-2" />
          Export Orders
        </Button>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search orders by ID or customer..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
      </div>
      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="min-w-full">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-3">
            <div className="col-span-4">Order Details</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <div 
                  className="px-6 py-4 grid grid-cols-12 gap-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="col-span-4">
                    <div className="flex items-center">
                      <ChevronDown 
                        size={18} 
                        className={`mr-2 text-gray-500 transition-transform ${expandedOrders.includes(order.id) ? 'transform rotate-180' : ''}`} 
                      />
                      <div>
                        <p className="font-medium text-baseContent">{order.id}</p>
                        <p className="text-sm text-baseContent-secondary">{order.customer_info?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-baseContent-secondary">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="font-medium">₦{order.total_amount?.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Order {selectedOrder?.id}</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <Tabs defaultValue="details">
                            <TabsList className="mb-4">
                              <TabsTrigger value="details">Order Details</TabsTrigger>
                              <TabsTrigger value="customer">Customer Info</TabsTrigger>
                              <TabsTrigger value="items">Items</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                                    <p className="font-medium">{selectedOrder.id}</p>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                                    <div className="flex items-center">
                                      {selectedOrder.payment === 'Completed' ? (
                                        <Check size={16} className="text-green-500 mr-1" />
                                      ) : selectedOrder.payment === 'Refunded' ? (
                                        <X size={16} className="text-red-500 mr-1" />
                                      ) : (
                                        <Clock size={16} className="text-orange-500 mr-1" />
                                      )}
                                      <span>{selectedOrder.payment}</span>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Delivery Method</p>
                                    <p className="font-medium">{selectedOrder.deliveryMethod}</p>
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-500 mb-2">Order Status</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                      {getStatusIcon(selectedOrder.status)}
                                      <span className="ml-1">{selectedOrder.status}</span>
                                    </span>
                                    <Select 
                                      defaultValue={selectedOrder.status} 
                                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Update Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {statusOptions.filter(s => s !== 'All Orders').map((status) => (
                                          <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="customer">
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                                  <p className="font-medium">{selectedOrder.customer_info?.name}</p>
                                </div>
                                {/* Add more customer info fields as needed */}
                              </div>
                            </TabsContent>
                            <TabsContent value="items">
                              <div className="space-y-4">
                                {/* Render order items if available */}
                                <div className="border-t pt-4 flex justify-between items-center">
                                  <p className="font-medium">Total</p>
                                  <p className="text-lg font-bold">₦{selectedOrder.total_amount?.toLocaleString()}</p>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                        <div className="flex justify-end gap-3 mt-4">
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                          <Button>Print Order</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {/* Expanded order details */}
                {expandedOrders.includes(order.id) && (
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Items</h4>
                        <div className="space-y-3">
                          {/* Render order items if available */}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Customer Information</h4>
                        <div className="text-sm space-y-1 text-baseContent-secondary">
                          {/* Render customer info if available */}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Select 
                        defaultValue={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.filter(s => s !== 'All Orders').map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline">Print Invoice</Button>
                      <Button>View Full Details</Button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {/* Empty state */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-baseContent mb-1">No orders found</h3>
          <p className="text-baseContent-secondary">
            Try adjusting your search or filters to find orders.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
