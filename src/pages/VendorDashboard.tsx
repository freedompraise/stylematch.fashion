import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Order, OrderStatus } from '@/types/OrderSchema'
import { ProductWithSales } from '@/types/ProductSchema'
import { useVendor } from '@/contexts/VendorContext'
import { useVendorData } from '@/services/vendorDataService'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardStats from '@/components/dashboard/DashboardStats'
import SalesChart from '@/components/dashboard/SalesChart'
import RecentOrders from '@/components/dashboard/RecentOrders'
import TopProducts from '@/components/dashboard/TopProducts'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState'
import { toast } from '@/components/ui/use-toast'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  lowStockProducts: number
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, vendor } = useVendor()
  const {
    products,
    getVendorStats,
  } = useVendorData();
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    lowStockProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<ProductWithSales[]>([])
  const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([])
  const [hasProducts, setHasProducts] = useState(false)
  const [hasOrders, setHasOrders] = useState(false)
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const vendorStats = await getVendorStats()
        setStats({
          totalSales: vendorStats.totalRevenue,
          totalOrders: vendorStats.totalOrders,
          averageOrderValue: vendorStats.totalOrders > 0 ? vendorStats.totalRevenue / vendorStats.totalOrders : 0,
          lowStockProducts: products.filter(p => p.stock_quantity <= 5).length
        })
        setRecentOrders(vendorStats.recentOrders as Order[])
        setHasProducts(products.length > 0)
        setHasOrders(vendorStats.totalOrders > 0)
        setTopProducts(
          products
            .map(p => ({
              ...p,
              sales: recentOrders.filter(order => order.product_id === p.id).length
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
        )
        setSalesData([])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch dashboard data.',
          variant: 'destructive'  
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [user?.id, getVendorStats, products.length])
  const { signOut } = useVendor();
  
  const handleSignOut = async () => {
    await signOut();
  }

  const navigateToProducts = () => {
    navigate('/products')
  }

  const navigateToOnboarding = () => {
    navigate('/onboarding')
  }

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (!hasProducts) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardEmptyState
            onAddProduct={navigateToProducts}
            onCompleteProfile={navigateToOnboarding}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          onAddProduct={navigateToProducts}
        />
        <DashboardStats
          totalSales={stats.totalSales}
          totalOrders={stats.totalOrders}
          averageOrderValue={stats.averageOrderValue}
          lowStockProducts={stats.lowStockProducts}
        />
        <SalesChart data={salesData} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasOrders ? <RecentOrders orders={recentOrders} /> : null}
          <TopProducts products={topProducts} />
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard
