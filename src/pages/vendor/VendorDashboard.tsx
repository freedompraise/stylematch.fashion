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
  const { 
    products, 
    orders, 
    calculateVendorStats, 
    getTopProducts,
    fetchProducts,
    fetchOrders,
    productsLoaded,
    ordersLoaded
  } = useVendorStore()
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<ProductWithSales[]>([])
  const [salesData, setSalesData] = useState<{ name: string; sales: number }[]>([])
  const [hasProducts, setHasProducts] = useState(false)
  const [hasOrders, setHasOrders] = useState(false)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Load products if not already loaded
        if (!productsLoaded) {
          await fetchProducts(true) // use cache
        }
        
        // Load orders if not already loaded
        if (!ordersLoaded) {
          await fetchOrders(true) // use cache
        }
        
        // Get fresh data from store after loading
        const currentProducts = products
        const currentOrders = orders
        
        const vendorStats = calculateVendorStats(currentProducts, currentOrders)
        
        setRecentOrders(vendorStats.recentOrders as Order[])
        setTopProducts(getTopProducts(currentProducts, currentOrders))
        setHasOrders(vendorStats.totalOrders > 0)
        setHasProducts(currentProducts.length > 0)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast({
          title: 'Error loading dashboard',
          description: 'Could not load dashboard data. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [fetchProducts, fetchOrders, productsLoaded, ordersLoaded, calculateVendorStats, getTopProducts, toast])

  // Calculate stats for display using fresh data
  const vendorStats = calculateVendorStats(products, orders)
  const stats: DashboardStats = {
    totalSales: vendorStats.totalRevenue,
    totalOrders: vendorStats.totalOrders,
    averageOrderValue: vendorStats.averageOrderValue,
    lowStockProducts: vendorStats.lowStockProducts
  }
 
  const navigateToProducts = () => {
    navigate('/vendor/products')
  }

  const navigateToProfile = () => {
    navigate('/vendor/settings')
  }

  if (loading) {
    return <DashboardLoadingState />
  }

  if (!hasProducts) {
    return (
      <div className="min-h-screen bg-background">
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

