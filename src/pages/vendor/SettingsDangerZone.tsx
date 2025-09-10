import React from 'react';
import { useVendorStore } from '@/stores';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2 } from 'lucide-react';

const SettingsDangerZone: React.FC = () => {
  const { signOut, removeProduct, fetchProducts, softDeleteProduct } = useVendorStore();
  const { toast } = useToast();

  const handleDeleteAllProducts = async () => {
    if (!confirm('Are you sure you want to delete all products? This action cannot be undone.')) {
      return;
    }

    try {
      const products = await fetchProducts(false);
      await Promise.all(products.map(product => softDeleteProduct(product.id, 'Bulk deletion from settings', product)));
      
      toast({
        title: 'All products deleted',
        description: 'All your products have been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete all products. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      return;
    }

    try {
      // Delete all products first
      const products = await fetchProducts(false);
      await Promise.all(products.map(product => softDeleteProduct(product.id, 'Account deletion', product)));
      
      // Sign out and redirect
      await signOut();
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Danger Zone</h1>
        <p className="text-muted-foreground">
          Irreversible and destructive actions.
        </p>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete All Products
          </CardTitle>
          <CardDescription>
            Permanently delete all your products. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAllProducts}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All Products
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDangerZone; 