
import React, { useState } from 'react';
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

// Sample order data
const sampleOrders = [
  {
    id: 'ORD001',
    customer: {
      name: 'Sophia Chen',
      email: 'sophia.chen@example.com',
      phone: '+234 812 345 6789',
      address: '123 Victoria Island, Lagos, Nigeria'
    },
    date: '12 Apr 2025',
    total: 15000,
    status: 'Processing',
    items: [
      { id: 1, name: 'Floral Summer Dress', price: 15000, quantity: 1, image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZsb3JhbCUyMGRyZXNzfGVufDB8fDB8fHww' }
    ],
    payment: 'Completed',
    deliveryMethod: 'Standard Shipping'
  },
  {
    id: 'ORD002',
    customer: {
      name: 'Marcus Johnson',
      email: 'marcus.johnson@example.com',
      phone: '+234 813 456 7890',
      address: '45 Admiralty Way, Lekki Phase 1, Lagos, Nigeria'
    },
    date: '11 Apr 2025',
    total: 8500,
    status: 'Shipped',
    items: [
      { id: 4, name: 'Cotton Graphic Tee', price: 5500, quantity: 1, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHQlMjBzaGlydHxlbnwwfHwwfHx8MA%3D%3D' },
      { id: 8, name: 'Lightweight Scarf', price: 3000, quantity: 1, image: 'https://images.unsplash.com/photo-1599391398131-cd12dfc6c24e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHNjYXJmfGVufDB8fDB8fHww' }
    ],
    payment: 'Completed',
    deliveryMethod: 'Express Shipping'
  },
  {
    id: 'ORD003',
    customer: {
      name: 'Aisha Williams',
      email: 'aisha.williams@example.com',
      phone: '+234 814 567 8901',
      address: '78 Allen Avenue, Ikeja, Lagos, Nigeria'
    },
    date: '10 Apr 2025',
    total: 22000,
    status: 'Delivered',
    items: [
      { id: 2, name: 'Premium Denim Jeans', price: 12500, quantity: 1, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVuaW0lMjBqZWFuc3xlbnwwfHwwfHx8MA%3D%3D' },
      { id: 5, name: 'Embroidered Silk Blouse', price: 9500, quantity: 1, image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmxvdXNlfGVufDB8fDB8fHww' }
    ],
    payment: 'Completed',
    deliveryMethod: 'Standard Shipping'
  },
  {
    id: 'ORD004',
    customer: {
      name: 'David Lee',
      email: 'david.lee@example.com',
      phone: '+234 815 678 9012',
      address: '25 Bourdillon Road, Ikoyi, Lagos, Nigeria'
    },
    date: '09 Apr 2025',
    total: 12750,
    status: 'Cancelled',
    items: [
      { id: 3, name: 'Leather Crossbody Bag', price: 12750, quantity: 1, image: 'https://images.unsplash.com/photo-1597633244018-0201d0158aab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxlYXRoZXIlMjBiYWd8ZW58MHx8MHx8fDA%3D' }
    ],
    payment: 'Refunded',
    deliveryMethod: 'Express Shipping'
  },
  {
    id: 'ORD005',
    customer: {
      name: 'Fatima Omar',
      email: 'fatima.omar@example.com',
      phone: '+234 816 789 0123',
      address: '10 Agege Motor Road, Mushin, Lagos, Nigeria'
    },
    date: '08 Apr 2025',
    total: 9500,
    status: 'Pending',
    items: [
      { id: 7, name: 'Summer Sandals', price: 9500, quantity: 1, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNhbmRhbHN8ZW58MHx8MHx8fDA%3D' }
    ],
    payment: 'Pending',
    deliveryMethod: 'Standard Shipping'
  }
];

const statusOptions = ['All Orders', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const OrderManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Filter orders based on search and status
  const filteredOrders = sampleOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
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
  
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    // In a real app, this would make an API call to update the order status
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
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
                        <p className="text-sm text-baseContent-secondary">{order.customer.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="text-sm text-baseContent-secondary">{order.date}</p>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <p className="font-medium">₦{order.total.toLocaleString()}</p>
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
                                    <p className="font-medium">{selectedOrder.date}</p>
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
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                                  <p className="font-medium">{selectedOrder.customer.name}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Email</p>
                                    <p className="font-medium">{selectedOrder.customer.email}</p>
                                  </div>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                                    <p className="font-medium">{selectedOrder.customer.phone}</p>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                                  <p className="font-medium">{selectedOrder.customer.address}</p>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="items">
                              <div className="space-y-4">
                                {selectedOrder.items.map((item: any) => (
                                  <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-16 h-16 object-cover rounded-md mr-4"
                                    />
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                      <p className="text-primary font-semibold">₦{item.price.toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="border-t pt-4 flex justify-between items-center">
                                  <p className="font-medium">Total</p>
                                  <p className="text-lg font-bold">₦{selectedOrder.total.toLocaleString()}</p>
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
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md mr-3"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-medium">₦{item.price.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Customer Information</h4>
                        <div className="text-sm space-y-1 text-baseContent-secondary">
                          <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                          <p><span className="font-medium">Phone:</span> {order.customer.phone}</p>
                          <p><span className="font-medium">Address:</span> {order.customer.address}</p>
                          <p className="mt-3"><span className="font-medium">Delivery Method:</span> {order.deliveryMethod}</p>
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
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
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
