import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from '@/contexts/SessionContext';
import { Product } from '@/types/ProductSchema';
import * as productService from '@/services/productService';
import { 
  Upload, 
  X, 
  Image, 
  Plus, 
  Instagram,
  Trash2
} from 'lucide-react';
import { ProductImageUpload } from './ProductImageUpload';

// Product schema for validation
const productSchema = z.object({
  products: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().min(0, 'Price must be a positive number'),
    category: z.string().min(1, 'Category is required'),
    size: z.array(z.string()).min(1, 'At least one size is required'),
    color: z.array(z.string()).min(1, 'At least one color is required'),
    stock: z.coerce.number().min(0, 'Stock must be a positive number'),
    discount_price: z.coerce.number().optional(),
    discount_start: z.date().optional(),
    discount_end: z.date().optional(),
    is_hottest_offer: z.boolean().default(false),
  }))
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
  onProductsAdded: (products: Product[]) => void;
}

export function AddProductDialog({ onProductsAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const { toast } = useToast();
  const { session } = useSession();
  const [productImages, setProductImages] = useState<(File | null)[]>([]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      products: [{
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
        is_hottest_offer: false,
      }]
    }
  });

  const addProduct = () => {
    const currentProducts = form.getValues('products');
    form.setValue('products', [
      ...currentProducts,
      {
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
        is_hottest_offer: false,
      }
    ]);
    setProductImages([...productImages, null]);
    setPreviewUrls([...previewUrls, null]);
  };

  const removeProduct = (index: number) => {
    const currentProducts = form.getValues('products');
    const newProducts = currentProducts.filter((_, i) => i !== index);
    form.setValue('products', newProducts);
    
    // Remove image and preview URL
    const newImages = productImages.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setProductImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const handleImageChange = (index: number, file: File | null) => {
    const newImages = [...productImages];
    newImages[index] = file;
    setProductImages(newImages);
  };

  const handlePreviewUrlChange = (index: number, url: string | null) => {
    const newUrls = [...previewUrls];
    newUrls[index] = url;
    setPreviewUrls(newUrls);
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to create products.",
        variant: "destructive"
      });
      return;
    }

    // Check if all products have images
    if (productImages.some(image => !image)) {
      toast({
        title: "Images required",
        description: "Please add an image for each product.",
        variant: "destructive"
      });
      return;
    }

    try {
      const createdProducts = await productService.createProducts(
        data.products.map((product, index) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          color: product.color,
          size: product.size,
          discount_price: product.discount_price,
          discount_start: product.discount_start,
          discount_end: product.discount_end,
          is_hottest_offer: product.is_hottest_offer,
          vendor_id: session.user.id,
          image: productImages[index]!
        }))
      );

      onProductsAdded(createdProducts);
      toast({
        title: "Products created",
        description: "Your products have been created successfully."
      });
      
      // Reset form and close dialog
      form.reset();
      setProductImages([]);
      setPreviewUrls([]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error creating products",
        description: "Could not create your products. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Products</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.getValues('products').map((_, index) => (
                  <div key={index} className="space-y-6 p-4 border rounded-lg relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeProduct(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <h3 className="text-lg font-semibold">Product {index + 1}</h3>
                    
                    <FormField
                      control={form.control}
                      name={`products.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`products.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`products.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`products.${index}.stock`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`products.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="clothing">Clothing</SelectItem>
                              <SelectItem value="shoes">Shoes</SelectItem>
                              <SelectItem value="accessories">Accessories</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Sizes</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                          <Button
                            key={size}
                            type="button"
                            variant={form.getValues(`products.${index}.size`).includes(size) ? 'default' : 'outline'}
                            onClick={() => {
                              const currentSizes = form.getValues(`products.${index}.size`);
                              const newSizes = currentSizes.includes(size)
                                ? currentSizes.filter(s => s !== size)
                                : [...currentSizes, size];
                              form.setValue(`products.${index}.size`, newSizes);
                            }}
                            className="h-8"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                      {form.formState.errors.products?.[index]?.size && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.products[index]?.size?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Colors</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'].map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant={form.getValues(`products.${index}.color`).includes(color) ? 'default' : 'outline'}
                            onClick={() => {
                              const currentColors = form.getValues(`products.${index}.color`);
                              const newColors = currentColors.includes(color)
                                ? currentColors.filter(c => c !== color)
                                : [...currentColors, color];
                              form.setValue(`products.${index}.color`, newColors);
                            }}
                            className="h-8"
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                      {form.formState.errors.products?.[index]?.color && (
                        <p className="text-sm text-red-500">
                          {form.formState.errors.products[index]?.color?.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Product Image</FormLabel>
                      <ProductImageUpload 
                        image={productImages[index]}
                        previewUrl={previewUrls[index]}
                        onImageChange={(file) => handleImageChange(index, file)}
                        onPreviewUrlChange={(url) => handlePreviewUrlChange(index, url)}
                        productIndex={index}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Product
                  </Button>
                  
                  <div className="space-x-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Products</Button>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <p className='text-sm'>The option of importing from Instagram and WhatsApp is coming soon</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 