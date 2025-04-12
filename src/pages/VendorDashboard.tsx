
import React from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Heart, 
  Bell,
  Menu,
  Search,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts and tables
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
  { name: 'Jul', sales: 3490 },
];

const recentOrders = [
  { id: '#ORD001', customer: 'Sophia Chen', date: '12 Apr 2025', amount: 'N15,000', status: 'Completed' },
  { id: '#ORD002', customer: 'Marcus Johnson', date: '11 Apr 2025', amount: 'N8,500', status: 'Processing' },
  { id: '#ORD003', customer: 'Aisha Williams', date: '10 Apr 2025', amount: 'N22,000', status: 'Processing' },
  { id: '#ORD004', customer: 'David Lee', date: '09 Apr 2025', amount: 'N12,750', status: 'Completed' },
];

const topProducts = [
  { name: 'Floral Summer Dress', category: 'Dresses', sales: 45, stock: 12 },
  { name: 'Premium Denim Jeans', category: 'Bottoms', sales: 38, stock: 24 },
  { name: 'Leather Crossbody Bag', category: 'Accessories', sales: 32, stock: 8 },
  { name: 'Cotton Graphic Tee', category: 'Tops', sales: 29, stock: 32 },
];

const VendorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-baseContent text-white hidden lg:block">
        <div className="p-6">
          <Logo className="brightness-0 invert" />
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2 text-white/60 text-xs font-semibold">MAIN MENU</div>
          <a href="#" className="flex items-center px-6 py-3 text-white bg-white/10">
            <BarChart3 size={20} className="mr-3" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-white/80 hover:bg-white/5 transition-colors">
            <ShoppingCart size={20} className="mr-3" />
            Orders
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-white/80 hover:bg-white/5 transition-colors">
            <Package size={20} className="mr-3" />
            Products
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-white/80 hover:bg-white/5 transition-colors">
            <Users size={20} className="mr-3" />
            Customers
          </a>
          
          <div className="px-4 py-2 mt-6 text-white/60 text-xs font-semibold">SETTINGS</div>
          <a href="#" className="flex items-center px-6 py-3 text-white/80 hover:bg-white/5 transition-colors">
            <DollarSign size={20} className="mr-3" />
            Payments
          </a>
          <a href="#" className="flex items-center px-6 py-3 text-white/80 hover:bg-white/5 transition-colors">
            <LogOut size={20} className="mr-3" />
            Sign Out
          </a>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="lg:hidden">
              <Button variant="outline" size="icon">
                <Menu size={20} />
              </Button>
            </div>
            
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-2 flex-1 max-w-md mx-4">
              <Search size={18} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="bg-transparent border-none focus:outline-none text-sm flex-1"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
              </Button>
              <div className="hidden md:block">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    SC
                  </div>
                  <span className="ml-2 font-medium text-baseContent">Sofia's Fashion</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="container mx-auto py-8 px-4">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <DollarSign size={24} className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-baseContent-secondary">Total Sales</p>
                    <h3 className="text-2xl font-bold text-baseContent">N147,250</h3>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp size={14} className="mr-1" /> +23% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <ShoppingCart size={24} className="text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-baseContent-secondary">Orders</p>
                    <h3 className="text-2xl font-bold text-baseContent">25</h3>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp size={14} className="mr-1" /> +12% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users size={24} className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-baseContent-secondary">Customers</p>
                    <h3 className="text-2xl font-bold text-baseContent">142</h3>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp size={14} className="mr-1" /> +18% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <Heart size={24} className="text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-baseContent-secondary">Wishlist Adds</p>
                    <h3 className="text-2xl font-bold text-baseContent">85</h3>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp size={14} className="mr-1" /> +32% from last month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sales Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#0055A4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Orders and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                  <Button variant="link" className="text-primary">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 font-semibold">Order ID</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3">{order.id}</td>
                          <td className="py-3">{order.customer}</td>
                          <td className="py-3">{order.date}</td>
                          <td className="py-3">{order.amount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Products */}
            <Card>
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
                  <Button variant="link" className="text-primary">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 font-semibold">Product</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Sales</th>
                        <th className="pb-3 font-semibold">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3">{product.name}</td>
                          <td className="py-3">{product.category}</td>
                          <td className="py-3">{product.sales} units</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {product.stock} left
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Product Alerts */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Product Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <TrendingUp size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-baseContent">Trending Product Alert</h4>
                    <p className="text-sm text-baseContent-secondary">Your "Floral Summer Dress" is trending! Sales have increased by 45% this week.</p>
                    <Button variant="link" className="text-primary p-0 mt-1">View Product</Button>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-full mr-4">
                    <Package size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-baseContent">Low Stock Alert</h4>
                    <p className="text-sm text-baseContent-secondary">Your "Leather Crossbody Bag" is running low with only 8 items left in stock.</p>
                    <Button variant="link" className="text-primary p-0 mt-1">Manage Inventory</Button>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="p-2 bg-pink-100 rounded-full mr-4">
                    <Heart size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-baseContent">Wishlist Alert</h4>
                    <p className="text-sm text-baseContent-secondary">Your "Premium Denim Jeans" has been added to 24 wishlists in the past week!</p>
                    <Button variant="link" className="text-primary p-0 mt-1">View Product</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
