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
import { useVendor } from '@/contexts/VendorContext';
import { Product, productsSchema, ProductFormValues } from '@/types/ProductSchema';
import { useVendorData } from '@/services/vendorDataService';
import { Plus, Trash2 } from 'lucide-react';
import { ProductImageUpload } from './ProductImageUpload';
import { FormActions } from '@/components/ui/form-actions';

interface AddProductDialogProps {
  onProductsAdded: (products: Product[]) => void;
}

export function AddProductDialog({ onProductsAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);  const [activeTab, setActiveTab] = useState('manual');
  const { toast } = useToast();
  const { user } = useVendor();
  const [productImages, setProductImages] = useState<(File | null)[]>([]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);
  const { createProducts } = useVendorData();

  const form = useForm<{ root: ProductFormValues }>({
    resolver: zodResolver(z.object({ root: productsSchema })),
    defaultValues: {
      root: [{
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category: '',
        color: [],
        size: [],
        vendor_id: session?.user?.id || '',
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
      color: [],
      size: [],
      vendor_id: session?.user?.id || '',
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
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to create products.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the new context service for image upload and creation
      const createdProducts = await createProducts(
        data.root.map((product, index) => ({
          ...product,
          vendor_id: session.user.id,
          image: productImages[index]!,
        }))
      );

      onProductsAdded(createdProducts);
      toast({
        title: "Products created",
        description: "Your products have been created successfully.",
        variant: "default"
      });

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
      console.error("Error during product creation process:", error);
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
                            variant={((form.getValues(`root.${index}.size`) as string[]) || []).includes(size) ? 'default' : 'outline'}
                            onClick={() => {
                              const currentSizes = (form.getValues(`root.${index}.size`) as string[]) || [];
                              const newSizes = currentSizes.includes(size)
                                ? currentSizes.filter(s => s !== size)
                                : [...currentSizes, size];
                              form.setValue(`root.${index}.size`, newSizes);
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
                            variant={((form.getValues(`root.${index}.color`) as string[]) || []).includes(color) ? 'default' : 'outline'}
                            onClick={() => {
                              const currentColors = (form.getValues(`root.${index}.color`) as string[]) || [];
                              const newColors = currentColors.includes(color)
                                ? currentColors.filter(c => c !== color)
                                : [...currentColors, color];
                              form.setValue(`root.${index}.color`, newColors);
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