import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, FileText } from 'lucide-react';

interface DashboardEmptyStateProps {
  onAddProduct: () => void;
  onCompleteProfile: () => void;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  onAddProduct,
  onCompleteProfile
}) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <Package size={64} className="mx-auto text-gray-400 mb-6" />
        <h3 className="text-xl font-medium mb-3">Welcome to Your Dashboard!</h3>
        <p className="text-gray-500 mb-8">
          Get started by adding your first product. Once you have products in your store,
          you'll be able to track sales, manage orders, and grow your business.
        </p>
        <div className="space-y-4">
          <Button size="lg" onClick={onAddProduct} className="w-full">
            <Package size={20} className="mr-2" />
            Add Your First Product
          </Button>
          <Button size="lg" variant="outline" onClick={onCompleteProfile} className="w-full">
            <FileText size={20} className="mr-2" />
            Complete Your Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmptyState; 