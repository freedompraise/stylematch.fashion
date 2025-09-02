import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Order, OrderStatus } from '@/types/OrderSchema'
import { ProductWithSales } from '@/types/ProductSchema'
import { useVendorStore } from '@/stores'
import DashboardStats from '@/components/vendor/dashboard/DashboardStats'
import SalesChart from '@/components/vendor/dashboard/SalesChart'
import RecentOrders from '@/components/vendor/dashboard/RecentOrders'
import TopProducts from '@/components/vendor/dashboard/TopProducts'
import DashboardEmptyState from '@/components/vendor/dashboard/DashboardEmptyState'
import DashboardLoadingState from '@/components/vendor/dashboard/DashboardLoadingState'
import { toast } from '@/components/ui/use-toast'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  lowStockProducts: number
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { vendor, products, orders, calculateVendorStats, getTopProducts } = useVendorStore()
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
      if (!vendor?.user_id) return
      setIsLoading(true)
      try {
        const vendorStats = calculateVendorStats(products, orders)
        setStats({
          totalSales: vendorStats.totalRevenue,
          totalOrders: vendorStats.totalOrders,
          averageOrderValue: vendorStats.totalOrders > 0 ? vendorStats.totalRevenue / vendorStats.totalOrders : 0,
          lowStockProducts: products.filter(p => p.stock_quantity <= 5).length
        })
        setRecentOrders(vendorStats.recentOrders as Order[])
        setHasProducts(products.length > 0)
        setHasOrders(vendorStats.totalOrders > 0)
        setTopProducts(getTopProducts(products, orders))
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
  }, [vendor?.user_id, products, orders, calculateVendorStats, getTopProducts])
 
  const navigateToProducts = () => {
    navigate('/vendor/products')
  }

  const navigateToProfile = () => {
    navigate('/vendor/settings')
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
            onCompleteProfile={navigateToProfile}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
