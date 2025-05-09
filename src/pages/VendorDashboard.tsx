import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Order,OrderStatus } from '@/types'
import { ProductWithSales } from '@/types/ProductSchema'
import { useSession } from '@/contexts/SessionContext'
import supabase from '@/lib/supabaseClient'
import { getVendorStats } from '@/services/vendorService'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardStats from '@/components/dashboard/DashboardStats'
import SalesChart from '@/components/dashboard/SalesChart'
import RecentOrders from '@/components/dashboard/RecentOrders'
import TopProducts from '@/components/dashboard/TopProducts'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react'
import { QuickActions, dashboardQuickActions } from '@/components/vendor/QuickActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  lowStockProducts: number
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { session } = useSession()
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
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return

      setIsLoading(true)
      try {
        const vendorStats = await getVendorStats(supabase, session.user.id)
        const totalOrders = vendorStats.totalOrders || 0
        const totalSales = vendorStats.totalRevenue || 0
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

        setStats({
          totalSales,
          totalOrders,
          averageOrderValue,
          lowStockProducts: 0
        })

        setRecentOrders((vendorStats.recentOrders as unknown as Order[]) || [])

        const salesByMonth = (vendorStats.recentOrders || []).reduce((acc, order) => {
          const month = new Date(order.created_at).toLocaleString('default', { month: 'short' })
          acc[month] = (acc[month] || 0) + order.total_amount
          return acc
        }, {} as Record<string, number>)

        setSalesData(
          Object.entries(salesByMonth).map(([name, sales]) => ({
            name,
            sales
          }))
        )

        setHasData(totalOrders > 0)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

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
          const newOrder = payload.new as Order
          setRecentOrders(prev => [newOrder, ...prev.slice(0, 4)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
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
    )
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
  )
}

export default VendorDashboard
