import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { useAuthStore, useVendorStore } from '@/stores';
import { Navigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface DashboardHeaderProps {
  onAddProduct: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddProduct }) => {
  const { signOut } = useAuthStore();
  const { clearVendorData } = useVendorStore();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      clearVendorData(); // Clear vendor data
      toast({
        title: 'Signed out',
        description: 'You have successfully signed out.',
      });
      return <Navigate to="/" replace />;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onAddProduct}>
          <Plus size={16} className="mr-2" />
          Add Product
        </Button>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader; 