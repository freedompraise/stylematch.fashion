import React from 'react';
import { DollarSign, ShoppingBag, AlertCircle } from 'lucide-react';
import StatsCard from './StatsCard';

interface DashboardStatsProps {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  lowStockProducts: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalSales,
  totalOrders,
  averageOrderValue,
  lowStockProducts
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        title="Total Sales"
        value={`₦${totalSales.toFixed(2)}`}
        description="Lifetime sales"
        icon={DollarSign}
      />
      <StatsCard
        title="Total Orders"
        value={totalOrders}
        description="Total number of orders"
        icon={ShoppingBag}
      />
      <StatsCard
        title="Low Stock Items"
        value={lowStockProducts}
        description="Products with stock less than 5"
        icon={AlertCircle}
      />
    </div>
  );
};

export default DashboardStats; 