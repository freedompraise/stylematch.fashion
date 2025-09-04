// ProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useVendorStore } from '@/stores';
import { Product } from '@/types/ProductSchema';
import { FilterBar } from '@/components/vendor/FilterBar';
import { QuickActions, productsQuickActions } from '@/components/vendor/QuickActions';
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog';
import { ProductList } from '@/components/vendor/products/ProductList';

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const {
    products,
    addProduct,
    updateProduct,
    removeProduct,
    setProducts,
    setProductsLoaded,
    fetchProducts,
    deleteProduct: deleteProductFromStore,
  } = useVendorStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products only once on mount
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        await fetchProducts(true); // use cache
      } catch (error) {
        if (mounted) {
          toast({
            title: 'Error loading products',
            description: 'Could not load your products. Please try again later.',
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [fetchProducts, toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleDeleteProduct = async (product: Product) => {
    console.log(`[ProductManagement] Initiating deletion for product: ${product.id}`);
    
    // Store the product in case we need to revert
    const productToDelete = { ...product };
    
    // Optimistically remove the product from the UI
    removeProduct(product.id);
    console.log(`[ProductManagement] Optimistically removed product from UI: ${product.id}`);
    
    toast({
      title: 'Product deleted',
      description: 'Your product is being deleted.',
    });

    try {
      console.log(`[ProductManagement] Starting background deletion for product: ${product.id}`);
      await deleteProductFromStore(productToDelete);
      console.log(`[ProductManagement] Background deletion successful for product: ${product.id}`);
    } catch (error) {
      console.error(`[ProductManagement] Background deletion failed for product: ${product.id}`, error);
      toast({
        title: 'Error deleting product',
        description: 'Could not delete your product. The item has been restored.',
        variant: 'destructive',
      });
      
      // Revert the change by adding the product back to the store
      addProduct(productToDelete);
      console.log(`[ProductManagement] Reverted optimistic deletion for product: ${product.id}`);
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
    // Product is already added to store by AddProductDialog
    setLoading(false);
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
