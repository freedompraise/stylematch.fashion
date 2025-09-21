import React, { useState } from 'react';
import { useVendorStore } from '@/stores';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';

export function SettingsDangerZone() {
  const { vendor, signOut, fetchProducts, softDeleteProduct } = useVendorStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteAllProducts = async () => {
    try {
      const products = await fetchProducts(false);
      await Promise.all(products.map(product => softDeleteProduct(product.id, 'Bulk deletion from settings', product)));
      toast.general.deleteAllProductsSuccess();
    } catch (error) {
      toast.general.deleteAllProductsError();
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Replace with your actual account deletion logic
      console.log('Deleting account...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await signOut();
      toast.general.deleteAccountSuccess();
      // Optionally, sign out the user and redirect
    } catch (error) {
      toast.general.deleteAccountError();
    } finally {
      setDialogOpen(false);
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