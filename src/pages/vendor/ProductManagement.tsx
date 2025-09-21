// ProductManagement.tsx

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useVendorStore } from '@/stores';
import { Product } from '@/types/ProductSchema';
import { FilterBar } from '@/components/vendor/FilterBar';
import { QuickActions, productsQuickActions } from '@/components/vendor/QuickActions';
import { AddProductDialog } from '@/components/vendor/products/AddProductDialog';
import { ProductList } from '@/components/vendor/products/ProductList';
import { ProductFilters } from '@/components/vendor/products/ProductFilters';
import { FilterSummary } from '@/components/vendor/products/FilterSummary';
import { filterProducts, ProductFilters as FilterType } from '@/utils/productFiltering';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/lib/toast';

const ProductManagement: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    removeProduct,
    setProducts,
    setProductsLoaded,
    fetchProducts,
    deleteProduct: deleteProductFromStore,
    softDeleteProduct,
  } = useVendorStore();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    category: 'all',
    priceRange: 'all',
    stockStatus: 'all',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Load products only once on mount
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        await fetchProducts(true); // use cache
      } catch (error) {
        if (mounted) {
          toast.products.loadError();
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
  }, [fetchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      priceRange: 'all',
      stockStatus: 'all',
    });
  };

  // Get filtered products
  const { filteredProducts, totalCount, hasResults } = filterProducts(products, filters);

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await softDeleteProduct(productToDelete.id);
      toast.products.deleteSuccess();
    } catch (error) {
      toast.products.deleteError();
    } finally {
      setProductToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      await updateProduct(productId, { stock_quantity: quantity });
      toast.success({
        title: 'Stock updated',
        description: 'Product stock has been updated successfully.',
      });
    } catch {
      toast.error({
        title: 'Error updating stock',
        description: 'Could not update product stock. Please try again.',
      });
    }
  };

  const handleProductAdded = (product: Product) => {
    // Product is already added to store by AddProductDialog
    setLoading(false);
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    // Product is already updated in store by EditProductDialog
    // No additional action needed here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <AddProductDialog onProductsAdded={products => handleProductAdded(products[0])} />
      </div>

     {/* {products.length > 0 && <QuickActions actions={productsQuickActions} />} */}

      {products.length > 0 && (
        <ProductFilters onFilterChange={handleFilterChange} />
      )}

      {products.length > 0 && (
        <FilterSummary
          filters={filters}
          totalProducts={products.length}
          filteredCount={filteredProducts.length}
          onClearFilters={handleClearFilters}
        />
      )}

      <ProductList
        products={filteredProducts}
        onDeleteProduct={handleDeleteProduct}
        onProductUpdated={handleProductUpdated}
        loading={loading}
      />

      {products.length === 0 && !loading && (
        <div className="text-center text-muted-foreground">
          No products in the database. You can add one by clicking the button above.
        </div>
      )}

      {products.length > 0 && !hasResults && !loading && (
        <div className="text-center text-muted-foreground">
          No products match your current filters. Try adjusting your search criteria.
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"?
              This action cannot be undone and will remove all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
