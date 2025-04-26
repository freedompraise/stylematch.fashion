import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onAddProduct: () => void;
  onSignOut: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddProduct, onSignOut }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onAddProduct}>
          <Plus size={16} className="mr-2" />
          Add Product
        </Button>
        <Button variant="outline" onClick={onSignOut}>
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader; 