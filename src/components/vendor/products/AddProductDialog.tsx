import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useVendorStore } from '@/stores';
import { Product, productsSchema, ProductFormValues } from '@/types/ProductSchema';
import { Plus, Trash2 } from 'lucide-react';
import { ProductImageUpload } from './ProductImageUpload';
import { FormActions } from '@/components/ui/form-actions';

interface AddProductDialogProps {
  onProductsAdded: (products: Product[]) => void;
}

export function AddProductDialog({ onProductsAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);  const [activeTab, setActiveTab] = useState('manual');
  const { toast } = useToast();
  const { vendor, createProduct } = useVendorStore();
  const [productImages, setProductImages] = useState<(File | null)[]>([]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);

  const form = useForm<{ root: ProductFormValues }>({
    resolver: zodResolver(z.object({ root: productsSchema })),
    defaultValues: {
      root: [{
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category: '',
        color: '',
        size: '',
        vendor_id: vendor?.user_id || '',
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "root" // Now this correctly references the array field
  });

  const addProduct = () => {
    append({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category: '',
      color: '',
      size: '',
      vendor_id: vendor?.user_id || '',
    });
    setProductImages([...productImages, null]);
    setPreviewUrls([...previewUrls, null]);
  };

  const removeProduct = (index: number) => {
    remove(index);
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

  const onSubmit = async (data: { root: ProductFormValues }) => {
    if (!vendor?.user_id) {
      toast({
        title: "Authentication required",
        description: "Please log in to create products.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create products using the store
      const createdProducts: Product[] = [];
      for (let i = 0; i < data.root.length; i++) {
        const productData = {
          ...data.root[i],
          vendor_id: vendor.user_id,
        };
        
        const createdProduct = await createProduct(productData);
        createdProducts.push(createdProduct);
      }

      onProductsAdded(createdProducts);
      toast({
        title: "Products created",
        description: `${createdProducts.length} product(s) have been created successfully.`,
      });
      setOpen(false);
      form.reset();
      setProductImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error('Error creating products:', error);
      toast({
        title: "Error",
        description: "Failed to create products. Please try again.",
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
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-6 p-4 border rounded-lg relative">
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
                      name={`root.${index}.name`}
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
                      name={`root.${index}.description`}
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
                        name={`root.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`root.${index}.stock_quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`root.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                            variant={form.getValues(`root.${index}.size`) === size ? 'default' : 'outline'}
                            onClick={() => {
                              const currentSize = form.getValues(`root.${index}.size`) || '';
                              const newSize = currentSize === size ? '' : size;
                              form.setValue(`root.${index}.size`, newSize);
                            }}
                            className="h-8"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                      <FormMessage>
                        {form.formState.errors?.root?.[index]?.['size']?.message}
                      </FormMessage>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Colors</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'].map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant={form.getValues(`root.${index}.color`) === color ? 'default' : 'outline'}
                            onClick={() => {
                              const currentColor = form.getValues(`root.${index}.color`) || '';
                              const newColor = currentColor === color ? '' : color;
                              form.setValue(`root.${index}.color`, newColor);
                            }}
                            className="h-8"
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                      <FormMessage>
                        {form.formState.errors?.root?.[index]?.['color']?.message}
                      </FormMessage>
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
                  
                  <FormActions
                  
                    onCancel={() => {
                      form.reset();
                      setProductImages([]);
                      setPreviewUrls([]);
                      
                      setOpen(false);

                      
                    }}
                  />
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