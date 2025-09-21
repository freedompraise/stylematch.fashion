import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { useAuthStore, useVendorStore } from '@/stores';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/toast';

interface DashboardHeaderProps {
  onAddProduct: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onAddProduct }) => {
  const { signOut } = useAuthStore();
  const { clearVendorData, vendor } = useVendorStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      clearVendorData();
      toast.auth.signOutSuccess();
      navigate('/');
    } catch (error) {
      toast.auth.signOutError();
    }
  };

  const handleCopyLink = () => {
    if (vendor?.store_slug) {
      const link = `${window.location.origin}/store/${vendor.store_slug}`;
      navigator.clipboard.writeText(link);
      toast.general.linkCopied();
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
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