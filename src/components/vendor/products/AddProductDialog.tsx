import{ useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCategoryOptions } from '@/constants/categories';
import { getSizeOptions, hasCustomSizes, getCustomSizePlaceholder } from '@/constants/sizes';
import { getColorOptions, getContrastColor } from '@/constants/colors';
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
import { useVendorStore } from '@/stores';
import { Product, productsSchema, ProductFormValues, createProductSchema } from '@/types/ProductSchema';
import { Plus, Trash2 } from 'lucide-react';
import { MultiImageUpload } from './MultiImageUpload';
import { FormActions } from '@/components/ui/form-actions';
import { toast } from '@/lib/toast';
import { getMaxAllowedImages } from '@/lib/featureFlags';

interface AddProductDialogProps {
  onProductsAdded: (products: Product[]) => void;
}

export function AddProductDialog({ onProductsAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const { createProduct } = useVendorStore();
  const [productImages, setProductImages] = useState<File[][]>([[]]);
  const [previewUrls, setPreviewUrls] = useState<string[][]>([[]]);
  const [customSizes, setCustomSizes] = useState<Record<number, string>>({});

  const form = useForm<{ products: ProductFormValues[] }>({
    resolver: zodResolver(z.object({ 
      products: z.array(createProductSchema)
    })),
    defaultValues: {
      products: [{
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category: '',
        color: '',
        size: '',
        images: [], // Will be populated when image is uploaded
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products"
  });

  // Sync arrays when fields change
  useEffect(() => {
    const currentLength = fields.length;
    const imagesLength = productImages.length;
    const urlsLength = previewUrls.length;

    if (currentLength > imagesLength) {
      // Add new entries
      setProductImages(prev => [...prev, ...Array(currentLength - imagesLength).fill([])]);
      setPreviewUrls(prev => [...prev, ...Array(currentLength - urlsLength).fill([])]);
    } else if (currentLength < imagesLength) {
      // Remove extra entries
      setProductImages(prev => prev.slice(0, currentLength));
      setPreviewUrls(prev => prev.slice(0, currentLength));
    }
  }, [fields.length, productImages.length, previewUrls.length]);

  // Revalidate form when images change
  useEffect(() => {
    form.trigger('products');
  }, [productImages, form]);

  // Debug form validation state
  useEffect(() => {
    console.log('Form validation state:', {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting
    });
  }, [form.formState.isValid, form.formState.errors, form.formState.isDirty, form.formState.isSubmitting]);

 

  const addProduct = () => {
    append({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category: '',
      color: '',
      size: '',
    });
  };

  const removeProduct = (index: number) => {
    remove(index);
  };

  const handleImagesChange = (index: number, files: File[]) => {
    setProductImages(prev => {
      const newImages = [...prev];
      newImages[index] = files;
      return newImages;
    });
  };

  const handlePreviewUrlsChange = (index: number, urls: string[]) => {
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = urls;
      return newUrls;
    });
  };

  const onSubmit = async (data: { products: ProductFormValues[] }) => {
    // Validate that all products have at least one image
    const missingImages = data.products.map((_, index) => index)
      .filter(index => !productImages[index] || productImages[index].length === 0);
    
    if (missingImages.length > 0) {
      toast.products.imageRequired();
      return;
    }

    try {
      const createdProducts: Product[] = [];
      for (let i = 0; i < data.products.length; i++) {
        const productData = data.products[i];
        const imageFiles = productImages[i];
        
        // Pass all images to createProduct
        const createdProduct = await createProduct(productData, imageFiles);
        createdProducts.push(createdProduct);
      }

      onProductsAdded(createdProducts);
      toast.products.createSuccess(createdProducts.length);
      setOpen(false);
      form.reset();
      setProductImages([[]]);
      setPreviewUrls([[]]);
      setCustomSizes({});
    } catch (error) {
      console.error('Error creating products:', error);
      toast.products.createError();
    }
  };

  const handleCancel = () => {
    form.reset();
    setProductImages([[]]);
    setPreviewUrls([[]]);
    setCustomSizes({});
    setOpen(false);
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
                            <FormLabel>Price (₦)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? 0 : Number(value));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`products.${index}.stock_quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? 0 : Number(value));
                                }}
                              />
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
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getCategoryOptions().map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Sizes</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const selectedCategory = form.watch(`products.${index}.category`);
                          const sizeOptions = selectedCategory ? getSizeOptions(selectedCategory) : [];
                          const showCustomSize = selectedCategory && hasCustomSizes(selectedCategory);
                          
                          return (
                            <>
                              {sizeOptions.map((size) => (
                          <Button
                                  key={size.value}
                            type="button"
                                  variant={form.watch(`products.${index}.size`) === size.value ? 'default' : 'outline'}
                            onClick={() => {
                              const currentSize = form.watch(`products.${index}.size`) || '';
                                    const newSize = currentSize === size.value ? '' : size.value;
                              form.setValue(`products.${index}.size`, newSize);
                                    // Clear custom size when selecting predefined size
                                    if (newSize) {
                                      setCustomSizes(prev => ({ ...prev, [index]: '' }));
                                    }
                            }}
                            className="h-8"
                                  title={size.description}
                          >
                                  {size.label}
                          </Button>
                        ))}
                              
                              {showCustomSize && (
                                <div className="flex items-center gap-2 w-full mt-2">
                                  <Input
                                    placeholder={getCustomSizePlaceholder(selectedCategory)}
                                    value={customSizes[index] || ''}
                                    onChange={(e) => {
                                      setCustomSizes(prev => ({ ...prev, [index]: e.target.value }));
                                      // Set the custom size as the selected size
                                      if (e.target.value) {
                                        form.setValue(`products.${index}.size`, e.target.value);
                                      }
                                    }}
                                    className="h-8"
                                  />
                                  <span className="text-xs text-muted-foreground">Custom Size</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <FormMessage>
                        {form.formState.errors?.products?.[index]?.['size']?.message}
                      </FormMessage>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Colors</FormLabel>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {getColorOptions().map((color) => (
                          <Button
                            key={color.value}
                            type="button"
                            variant={form.watch(`products.${index}.color`) === color.value ? 'default' : 'outline'}
                            onClick={() => {
                              const currentColor = form.watch(`products.${index}.color`) || '';
                              const newColor = currentColor === color.value ? '' : color.value;
                              form.setValue(`products.${index}.color`, newColor);
                            }}
                            className={`h-8 transition-all duration-200 ${
                              form.watch(`products.${index}.color`) === color.value 
                                ? 'h-10 scale-110 shadow-lg ring-2 ring-offset-2' 
                                : 'hover:scale-105'
                            }`}
                            title={color.description}
                            style={color.hex ? { 
                              backgroundColor: color.hex, 
                              color: getContrastColor(color.hex),
                              border: `1px solid ${getContrastColor(color.hex)}20`
                            } : undefined}
                          >
                            {color.label}
                          </Button>
                        ))}
                      </div>
                      <FormMessage>
                        {form.formState.errors?.products?.[index]?.['color']?.message}
                      </FormMessage>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Product Images</FormLabel>
                      <MultiImageUpload 
                        images={productImages[index] || []}
                        previewUrls={previewUrls[index] || []}
                        onImagesChange={(files) => handleImagesChange(index, files)}
                        onPreviewUrlsChange={(urls) => handlePreviewUrlsChange(index, urls)}
                        productIndex={index}
                        maxImages={getMaxAllowedImages()}
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
                    onCancel={handleCancel}
                    submitText="Create Products"
                    submittingText="Creating..."
                    isSubmitting={form.formState.isSubmitting}
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