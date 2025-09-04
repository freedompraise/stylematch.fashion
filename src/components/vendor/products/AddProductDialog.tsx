import{ useState, useEffect } from 'react';
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
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const { toast } = useToast();
  const { createProduct } = useVendorStore();
  const [productImages, setProductImages] = useState<(File | null)[]>([]);
  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);

  const form = useForm<{ products: ProductFormValues[] }>({
    resolver: zodResolver(z.object({ products: z.array(productsSchema) })),
    defaultValues: {
      products: [{
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category: '',
        color: '',
        size: '',
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
      setProductImages(prev => [...prev, ...Array(currentLength - imagesLength).fill(null)]);
      setPreviewUrls(prev => [...prev, ...Array(currentLength - urlsLength).fill(null)]);
    } else if (currentLength < imagesLength) {
      // Remove extra entries
      setProductImages(prev => prev.slice(0, currentLength));
      setPreviewUrls(prev => prev.slice(0, currentLength));
    }
  }, [fields.length, productImages.length, previewUrls.length]);

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

  const handleImageChange = (index: number, file: File | null) => {
    setProductImages(prev => {
      const newImages = [...prev];
    newImages[index] = file;
      return newImages;
    });
  };

  const handlePreviewUrlChange = (index: number, url: string | null) => {
    setPreviewUrls(prev => {
      const newUrls = [...prev];
    newUrls[index] = url;
      return newUrls;
    });
  };

  const onSubmit = async (data: { products: ProductFormValues[] }) => {
    try {
      const createdProducts: Product[] = [];
      for (let i = 0; i < data.products.length; i++) {
        const productData = data.products[i];
        
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

  const handleCancel = () => {
    form.reset();
    setProductImages([]);
    setPreviewUrls([]);
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
                            <FormLabel>Price</FormLabel>
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
                            variant={form.watch(`products.${index}.size`) === size ? 'default' : 'outline'}
                            onClick={() => {
                              const currentSize = form.watch(`products.${index}.size`) || '';
                              const newSize = currentSize === size ? '' : size;
                              form.setValue(`products.${index}.size`, newSize);
                            }}
                            className="h-8"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                      <FormMessage>
                        {form.formState.errors?.products?.[index]?.['size']?.message}
                      </FormMessage>
                    </div>
                    
                    <div className="space-y-2">
                      <FormLabel>Colors</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'].map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant={form.watch(`products.${index}.color`) === color ? 'default' : 'outline'}
                            onClick={() => {
                              const currentColor = form.watch(`products.${index}.color`) || '';
                              const newColor = currentColor === color ? '' : color;
                              form.setValue(`products.${index}.color`, newColor);
                            }}
                            className="h-8"
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                      <FormMessage>
                        {form.formState.errors?.products?.[index]?.['color']?.message}
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