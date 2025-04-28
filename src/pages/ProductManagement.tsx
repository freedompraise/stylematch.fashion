import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronDown, 
  Upload,
  X,
  Image,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/SessionContext';
import { Product } from '@/types';
import supabase from '@/lib/supabaseClient';
import * as productService from '@/services/productService';
import { FilterBar, FilterConfig, FilterValue } from '@/components/vendor/FilterBar';
import { QuickActions, productsQuickActions } from '@/components/vendor/QuickActions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Categories for dropdown
const categories = [
  'All Categories', 
  'Dresses', 
  'Tops', 
  'Bottoms', 
  'Accessories', 
  'Shoes', 
  'Outerwear'
];

// Filter configurations
const filterConfigs: FilterConfig[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'All Categories', value: '' },
      { label: 'Dresses', value: 'Dresses' },
      { label: 'Tops', value: 'Tops' },
      { label: 'Bottoms', value: 'Bottoms' },
      { label: 'Accessories', value: 'Accessories' },
    ],
  },
  {
    id: 'status',
    label: 'Stock Status',
    type: 'select',
    options: [
      { label: 'All Statuses', value: '' },
      { label: 'In Stock', value: 'In Stock' },
      { label: 'Low Stock', value: 'Low Stock' },
      { label: 'Out of Stock', value: 'Out of Stock' },
    ],
  },
  {
    id: 'price',
    label: 'Price Range',
    type: 'range',
    min: 0,
    max: 100,
    step: 10,
  },
];

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const { session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterValue>({});
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    size: [] as string[],
    color: [] as string[],
    stock: 0,
    discount_price: undefined as number | undefined,
    discount_start: undefined as Date | undefined,
    discount_end: undefined as Date | undefined,
    is_hottest_offer: false
  });

  // Load vendor's products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (session?.user?.id) {
          const vendorProducts = await productService.getVendorProducts(supabase, session.user.id);
          setProducts(vendorProducts);
        }
      } catch (error) {
        toast({
          title: "Error loading products",
          description: "Could not load your products. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [session?.user?.id]);

  // Handle filter changes
  const handleFilterChange = (filters: FilterValue) => {
    setActiveFilters(filters);
    
    // Apply filters to products
    let filteredProducts = [...products];
    
    // Apply category filter
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category === filters.category
      );
    }
    
    // Apply status filter
    if (filters.status) {
      filteredProducts = filteredProducts.filter(
        product => product.stock <= 5 && product.stock > 0 ? 'Low Stock' : product.stock === 0 ? 'Out of Stock' : 'In Stock' === filters.status
      );
    }
    
    // Apply price range filter
    if (Array.isArray(filters.price)) {
      const [min, max] = filters.price as [number, number];
      filteredProducts = filteredProducts.filter(
        product => product.price >= min && product.price <= max
      );
    }
    
    // Apply search query
    if (searchQuery) {
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setProducts(filteredProducts);
  };

  // Handle search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Re-apply filters with new search query
    handleFilterChange(activeFilters);
  };

  // Handle drag and drop for multiple product images
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      setDraggedFiles(prevFiles => [...prevFiles, ...fileArray]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).filter(
        file => file.type.startsWith('image/')
      );
      setDraggedFiles(prevFiles => [...prevFiles, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setDraggedFiles(draggedFiles.filter((_, i) => i !== index));
  };

  // Create product
  const handleCreateProduct = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to create products.",
        variant: "destructive"
      });
      return;
    }

    try {
      const product = await productService.createProduct(
        supabase,
        {
          ...newProduct,
          vendor_id: session.user.id
        },
        draggedFiles
      );

      setProducts(prev => [product, ...prev]);
      toast({
        title: "Product created",
        description: "Your product has been created successfully."
      });

      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        size: [],
        color: [],
        stock: 0,
        discount_price: undefined,
        discount_start: undefined,
        discount_end: undefined,
        is_hottest_offer: false
      });
      setDraggedFiles([]);
    } catch (error) {
      toast({
        title: "Error creating product",
        description: "Could not create your product. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(supabase, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error deleting product",
        description: "Could not delete your product. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Update product stock
  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      await productService.updateProductStock(supabase, productId, quantity);
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: quantity } : p
      ));
      toast({
        title: "Stock updated",
        description: "Product stock has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error updating stock",
        description: "Could not update product stock. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link to="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={productsQuickActions} />

      {/* Search and Filters */}
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
        
        <FilterBar
          filters={filterConfigs}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div className="font-medium">{product.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.stock} in stock</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.stock <= 5 && product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : product.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.stock <= 5 && product.stock > 0 ? 'Low Stock' : product.stock === 0 ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductManagement;
