// ProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/SessionContext';
import { Product } from '@/types/ProductSchema';
import { useVendorData } from '@/services/vendorDataService';
import { FilterBar } from '@/components/vendor/FilterBar';
import { QuickActions, productsQuickActions } from '@/components/vendor/QuickActions';
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog';
import { ProductList } from '@/components/vendor/products/ProductList';

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const { session } = useSession();
  const {
    products,
    fetchProducts,
    deleteProduct,
    updateProduct,
    createProduct,
  } = useVendorData();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;
    setLoading(true);
    fetchProducts(session.user.id)
      .catch(() => {
        toast({
          title: 'Error loading products',
          description: 'Could not load your products. Please try again later.',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id, toast, fetchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: 'Product deleted',
        description: 'Your product has been deleted successfully.',
      });
    } catch {
      toast({
        title: 'Error deleting product',
        description: 'Could not delete your product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      await updateProduct(productId, { stock_quantity: quantity });
      toast({
        title: 'Stock updated',
        description: 'Product stock has been updated successfully.',
      });
    } catch {
      toast({
        title: 'Error updating stock',
        description: 'Could not update product stock. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProductAdded = (product: Product) => {
    fetchProducts(session?.user?.id || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <AddProductDialog onProductsAdded={products => handleProductAdded(products[0])} />
      </div>

      {products.length > 0 && <QuickActions actions={productsQuickActions} />}
{/* 
      {products.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <FilterBar />
        </div>
      )} */}

      <ProductList
        products={products}
        onDeleteProduct={handleDeleteProduct}
        loading={loading}
      />

      {products.length === 0 && !loading && (
        <div className="text-center text-muted-foreground">
          No products in the database. You can add one by clicking the button above.
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
