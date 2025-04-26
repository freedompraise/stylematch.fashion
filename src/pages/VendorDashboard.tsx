import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Order, Product, ProductWithSales } from '@/types';
import { useSession } from '@/contexts/SessionContext';
import supabase from '@/lib/supabaseClient';

// Import dashboard components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrders from '@/components/dashboard/RecentOrders';
import TopProducts from '@/components/dashboard/TopProducts';
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  lowStockProducts: number;
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<ProductWithSales[]>([]);
  const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        // Fetch orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', session.user.id);

        if (ordersError) throw ordersError;

        // Fetch products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', session.user.id);

        if (productsError) throw productsError;

        // Calculate stats
        const totalOrders = orders.length;
        const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        const lowStockProducts = products.filter(product => product.stock < 5).length;

        setStats({
          totalSales,
          totalOrders,
          averageOrderValue,
          lowStockProducts
        });

        // Set recent orders (last 5)
        const recentOrders = orders
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentOrders(recentOrders);

        // Set top products
        const productSales: ProductWithSales[] = products.map(product => ({
          ...product,
          sales: orders.filter(order => order.product_id === product.id).length
        }));
        const topProducts = productSales
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        setTopProducts(topProducts);

        // Set sales data for chart
        const salesByMonth = orders.reduce((acc, order) => {
          const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + order.total_amount;
          return acc;
        }, {} as Record<string, number>);

        setSalesData(
          Object.entries(salesByMonth).map(([name, sales]) => ({
            name,
            sales: sales as number
          }))
        );

        // Check if we have any data
        setHasData(totalOrders > 0 || products.length > 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${session?.user?.id}`
        },
        (payload) => {
          const newOrder = payload.new as Order;
          setRecentOrders(prevOrders => [newOrder, ...prevOrders.slice(0, 4)]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigateToProducts = () => {
    navigate('/vendor/products');
  };

  const navigateToOnboarding = () => {
    navigate('/vendor/onboarding');
  };

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardEmptyState 
            onAddProduct={navigateToProducts}
            onCompleteProfile={navigateToOnboarding}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader 
          onAddProduct={navigateToProducts}
          onSignOut={handleSignOut}
        />
        
        <DashboardStats 
          totalSales={stats.totalSales}
          totalOrders={stats.totalOrders}
          averageOrderValue={stats.averageOrderValue}
          lowStockProducts={stats.lowStockProducts}
        />
        
        <SalesChart data={salesData} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentOrders orders={recentOrders} />
          <TopProducts products={topProducts} />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
