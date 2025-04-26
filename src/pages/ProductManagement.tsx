import React, { useState, useEffect } from 'react';
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
  Image
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

const ProductManagement: React.FC = () => {
  const { toast } = useToast();
  const { session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
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

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-baseContent">Product Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-full">
            <DialogHeader>
              <DialogTitle>Add New Products</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="single">
              <TabsList className="mb-4">
                <TabsTrigger value="single">Single Upload</TabsTrigger>
                <TabsTrigger value="multiple">Multiple Upload</TabsTrigger>
                <TabsTrigger value="import">Catalog Import</TabsTrigger>
              </TabsList>
              
              <TabsContent value="single">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <div 
                      className="border-2 border-dashed rounded-lg h-60 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => document.getElementById('single-product-image')?.click()}
                    >
                      <Image className="text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-center text-gray-500">
                        Click to upload product image<br />
                        <span className="text-xs">JPG, PNG or GIF</span>
                      </p>
                      <input 
                        type="file"
                        id="single-product-image"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name</label>
                      <Input 
                        placeholder="e.g., Floral Summer Dress" 
                        value={newProduct.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Select 
                          value={newProduct.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.slice(1).map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price (₦)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 15000" 
                          value={newProduct.price || ''}
                          onChange={(e) => handleInputChange('price', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 20" 
                          value={newProduct.stock || ''}
                          onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Discount Price (₦)</label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 12000" 
                          value={newProduct.discount_price || ''}
                          onChange={(e) => handleInputChange('discount_price', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <Textarea 
                        placeholder="Describe your product..." 
                        rows={4}
                        value={newProduct.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleCreateProduct}>Save Product</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="multiple">
                <div className="space-y-6">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                      isDragging ? 'bg-primary/5 border-primary' : 'hover:bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="text-gray-400 mb-4" size={40} />
                      <h3 className="text-lg font-medium mb-2">Drag and drop product images</h3>
                      <p className="text-sm text-center text-gray-500 mb-4">
                        Or click to browse from your computer<br />
                        <span className="text-xs">You can upload multiple images at once</span>
                      </p>
                      <Button variant="outline" onClick={() => document.getElementById('multiple-product-images')?.click()}>
                        Browse Images
                      </Button>
                      <input 
                        type="file"
                        id="multiple-product-images"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                  
                  {draggedFiles.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Selected Images ({draggedFiles.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {draggedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Product ${index}`}
                              className="w-full h-32 object-cover rounded-md"
                            />
                            <button
                              onClick={() => removeFile(index)}
                              className="absolute top-2 right-2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                            <div className="mt-2 text-sm truncate">{file.name}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-between">
                        <p className="text-sm text-gray-500">
                          Now you can add details for each product or batch update categories and attributes.
                        </p>
                        <Button>Continue to Details</Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="import">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                    <p className="text-baseContent">
                      Import your product catalog from WhatsApp or Instagram. Our system will automatically detect and process your products.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
                          <path fill="#25D366" d="M128 0C57.307 0 0 57.307 0 128c0 25.306 7.333 49.067 20.073 68.946L1.789 256l61.127-18.851C81.861 249.86 104.064 256 128 256c70.693 0 128-57.307 128-128S198.693 0 128 0z"/>
                          <path fill="#FFF" d="M186.183 139.19c-2.416-1.262-14.32-7.608-16.541-8.47c-2.22-.86-3.833-1.256-5.516 1.256c-1.682 2.511-6.246 8.32-7.65 10.053c-1.414 1.734-2.82 1.893-5.228.632c-2.416-1.261-10.212-4.052-19.33-12.794c-7.16-6.855-12.026-15.204-13.432-17.724c-1.413-2.511-.145-3.879 1.058-5.138c1.114-1.12 2.458-2.934 3.677-4.4c1.22-1.468 1.676-2.532 2.456-4.268c.786-1.732.416-3.257-.177-4.517c-.586-1.26-5.436-14.157-7.65-19.34c-1.936-4.881-4.005-4.695-5.512-4.818c-1.415-.121-3.026-.122-4.634-.122c-1.683 0-4.347.633-6.567 3.144c-2.228 2.511-8.322 8.342-8.322 20.156c0 11.813 8.322 23.221 9.528 24.798c1.208 1.578 16.582 28.092 41.172 38.076c5.754 2.68 10.218 4.272 13.66 5.51c5.73 1.957 10.936 1.658 15.056 1.01c4.581-.735 14.078-6.208 16.106-12.231c2.033-6.024 2.033-11.13 1.415-12.179c-.624-1.05-2.318-1.682-4.727-2.944z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Import from WhatsApp</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Export your WhatsApp catalog or send us your product lists via WhatsApp
                      </p>
                      <Button>Connect WhatsApp</Button>
                    </div>
                    
                    <div className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
                          <linearGradient id="a" x1="1.464" x2="254.536" y1="254.536" y2="1.464" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#FED576"/>
                            <stop offset=".263" stopColor="#F47133"/>
                            <stop offset=".609" stopColor="#BC3081"/>
                            <stop offset="1" stopColor="#4C63D2"/>
                          </linearGradient>
                          <path fill="url(#a)" d="M128 0c-34.757 0-39.122.147-52.796.77c-13.627.623-22.95 2.785-31.102 5.95c-8.413 3.272-15.562 7.65-22.66 14.748S9.665 35.696 6.393 44.11C3.228 52.26 1.065 61.583.443 75.21C.147 88.884 0 93.248 0 128.005s.147 39.12.77 52.794c.623 13.627 2.785 22.95 5.95 31.1c3.272 8.415 7.65 15.563 14.748 22.662s14.25 11.476 22.66 14.748c8.15 3.164 17.473 5.327 31.1 5.95c13.674.622 18.04.77 52.796.77s39.12-.148 52.795-.77c13.628-.623 22.95-2.786 31.1-5.95c8.413-3.272 15.562-7.65 22.662-14.748c7.098-7.098 11.476-14.247 14.748-22.662c3.164-8.15 5.327-17.473 5.95-31.1c.622-13.673.769-18.04.769-52.794s-.147-39.12-.77-52.796c-.623-13.627-2.786-22.95-5.95-31.1c-3.272-8.414-7.65-15.562-14.748-22.66S209.415 9.665 201 6.393C192.85 3.228 183.526 1.065 169.9.443C156.226.147 151.86 0 128.001 0z"/>
                          <path fill="#FFF" d="M128 34.057c-25.38 0-28.515.11-38.476.562c-9.93.455-16.71 2.03-22.642 4.337c-6.133 2.38-11.333 5.564-16.52 10.75c-5.19 5.187-8.37 10.387-10.75 16.52c-2.31 5.933-3.882 12.715-4.337 22.645c-.452 9.96-.562 13.095-.562 38.473s.11 28.514.562 38.474c.455 9.93 2.03 16.71 4.337 22.642c2.38 6.133 5.564 11.333 10.75 16.52c5.187 5.188 10.387 8.372 16.52 10.75c5.933 2.308 12.715 3.882 22.645 4.337c9.96.452 13.095.562 38.473.562c25.38 0 28.514-.11 38.474-.562c9.93-.455 16.712-2.03 22.644-4.337c6.132-2.38 11.332-5.564 16.518-10.75c5.19-5.188 8.372-10.39 10.75-16.52c2.307-5.933 3.882-12.716 4.337-22.644c.452-9.962.562-13.097.562-38.475s-.11-28.514-.562-38.473c-.455-9.932-2.03-16.713-4.337-22.645c-2.38-6.134-5.564-11.334-10.75-16.52c-5.188-5.188-10.388-8.372-16.52-10.75c-5.934-2.307-12.716-3.882-22.645-4.337c-9.96-.453-13.095-.563-38.474-.563zm0 16.817c24.95 0 27.915.096 37.77.544c9.12.417 14.062 1.94 17.356 3.217c4.368 1.698 7.488 3.724 10.76 6.997c3.274 3.272 5.3 6.394 6.998 10.76c1.28 3.292 2.8 8.235 3.217 17.355c.448 9.854.545 12.82.545 37.768s-.097 27.915-.545 37.768c-.417 9.12-1.94 14.064-3.217 17.356c-1.698 4.368-3.724 7.488-6.998 10.76c-3.272 3.274-6.392 5.3-10.76 6.998c-3.294 1.278-8.236 2.8-17.356 3.217c-9.85.448-12.815.545-37.77.545s-27.92-.097-37.77-.545c-9.12-.417-14.062-1.94-17.356-3.217c-4.368-1.698-7.49-3.724-10.762-6.998c-3.273-3.272-5.3-6.392-6.998-10.76c-1.276-3.292-2.8-8.235-3.217-17.356c-.448-9.853-.544-12.818-.544-37.77s.096-27.913.544-37.767c.417-9.12 1.94-14.062 3.217-17.355c1.698-4.368 3.724-7.49 6.998-10.76c3.272-3.274 6.394-5.3 10.76-6.998c3.294-1.278 8.236-2.8 17.356-3.217c9.85-.448 12.818-.544 37.77-.544z"/>
                          <path fill="#FFF" d="M128 170.07c-23.234 0-42.07-18.834-42.07-42.07s18.836-42.07 42.07-42.07s42.07 18.835 42.07 42.07s-18.836 42.07-42.07 42.07zm0-106.92c-35.752 0-64.85 29.1-64.85 64.85s29.098 64.85 64.85 64.85s64.85-29.098 64.85-64.85s-29.1-64.85-64.85-64.85zm82.588-2.023c0 8.153-6.614 14.766-14.767 14.766s-14.767-6.612-14.767-14.766s6.614-14.766 14.767-14.766s14.767 6.614 14.767 14.766z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Import from Instagram</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Connect your Instagram account to import products from your posts
                      </p>
                      <Button>Connect Instagram</Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t pt-6">
                    <h3 className="font-semibold mb-3">Or upload catalog file</h3>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center">
                      <p className="text-sm text-gray-500 mb-4 text-center">
                        Upload a JSON, CSV or Excel file with your product catalog
                      </p>
                      <Button variant="outline">Upload File</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search products..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-baseContent-secondary">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-white">
                      <Edit size={15} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 bg-white text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-medium">
                      Low Stock
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-baseContent truncate">{product.name}</h3>
                  <p className="text-sm text-baseContent-secondary mb-2">{product.category}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-primary">₦{product.price.toLocaleString()}</p>
                    <p className="text-sm">{product.stock} in stock</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-baseContent mb-1">No products found</h3>
              <p className="text-baseContent-secondary mb-6">
                Try adjusting your search or filters, or add a new product.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={18} className="mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductManagement;
