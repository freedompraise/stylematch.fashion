// src/components/vendor/products/EditProductDialog.tsx
// Updated to align with AddProductDialog patterns
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
} from '@/components/ui/dialog';
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
import { Product, ProductFormValues } from '@/types/ProductSchema';
import { ProductImageUpload } from './ProductImageUpload';
import { FormActions } from '@/components/ui/form-actions';

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: (updatedProduct: Product) => void;
}

// Use the same form values as AddProductDialog for consistency
type EditProductFormValues = ProductFormValues;

export function EditProductDialog({ 
  product, 
  open, 
  onOpenChange, 
  onProductUpdated 
}: EditProductDialogProps) {
  const { toast } = useToast();
  const { updateProduct } = useVendorStore();
  const [productImage, setProductImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
  const [customSize, setCustomSize] = useState<string>('');

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      price: z.number().min(0, "Price must be positive"),
      stock_quantity: z.number().min(0, "Stock must be positive"),
      category: z.string().min(1, "Category is required"),
      color: z.string(),
      size: z.string(),
    }).refine(
      () => {
        // Check if product has existing image OR new image uploaded OR image removal is not requested
        const hasExistingImage = product?.images && product.images.length > 0;
        const hasNewImage = productImage !== null;
        const isRemovingImage = shouldRemoveImage;
        
        // Valid if: (has existing image AND not removing) OR (has new image) OR (removing image is intentional)
        return (hasExistingImage && !isRemovingImage) || hasNewImage;
      },
      {
        message: "Product image is required for better visibility and sales",
        path: ["name"] // Use name field to show error at form level
      }
    )),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category: '',
      color: '',
      size: '',
    }
  });

  // Reset form when product changes
  useEffect(() => {
    if (product && open) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        category: product.category,
        color: product.color || '',
        size: product.size || '',
      });
      
      // Set preview URL from existing images
      if (product.images && product.images.length > 0) {
        setPreviewUrl(product.images[0]);
      } else {
        setPreviewUrl(null);
      }
      setProductImage(null);
      setShouldRemoveImage(false);
      setCustomSize('');
    }
  }, [product, open, form]);

  // Revalidate form when image state changes
  useEffect(() => {
    form.trigger();
  }, [productImage, shouldRemoveImage, form]);

  const onSubmit = async (data: EditProductFormValues) => {
    if (!product) return;

    try {
      setIsSubmitting(true);
      
      // Update the product with image file if provided, or remove image if requested
      const updatedProduct = await (updateProduct as any)(
        product.id, 
        data, 
        productImage || undefined, 
        product, 
        shouldRemoveImage
      );
      
      toast({
        title: 'Product updated',
        description: `${updatedProduct.name} has been updated successfully.`,
      });

      onProductUpdated(updatedProduct);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error updating product',
        description: 'Could not update the product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setProductImage(null);
    setPreviewUrl(null);
    setShouldRemoveImage(false);
    setCustomSize('');
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              <ProductImageUpload
                image={productImage}
                previewUrl={previewUrl}
                onImageChange={setProductImage}
                onPreviewUrlChange={setPreviewUrl}
                onImageRemoved={() => setShouldRemoveImage(true)}
                productIndex={0}
              />
            </div>

            {/* Product Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₦)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getCategoryOptions().map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size Selection */}
            <div className="space-y-2">
              <FormLabel>Size</FormLabel>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const selectedCategory = form.watch('category');
                  const sizeOptions = selectedCategory ? getSizeOptions(selectedCategory) : [];
                  const showCustomSize = selectedCategory && hasCustomSizes(selectedCategory);
                  
                  return (
                    <>
                      {sizeOptions.map((size) => (
                        <Button
                          key={size.value}
                          type="button"
                          variant={form.watch('size') === size.value ? 'default' : 'outline'}
                          onClick={() => {
                            const currentSize = form.watch('size') || '';
                            const newSize = currentSize === size.value ? '' : size.value;
                            form.setValue('size', newSize);
                            // Clear custom size when selecting predefined size
                            if (newSize) {
                              setCustomSize('');
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
                            value={customSize}
                            onChange={(e) => {
                              setCustomSize(e.target.value);
                              // Set the custom size as the selected size
                              if (e.target.value) {
                                form.setValue('size', e.target.value);
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
                {form.formState.errors?.size?.message}
              </FormMessage>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <FormLabel>Color</FormLabel>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {getColorOptions().map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant={form.watch('color') === color.value ? 'default' : 'outline'}
                    onClick={() => {
                      const currentColor = form.watch('color') || '';
                      const newColor = currentColor === color.value ? '' : color.value;
                      form.setValue('color', newColor);
                    }}
                    className={`h-8 transition-all duration-200 ${
                      (form.watch('color') === color.value || product?.color === color.value) 
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
                {form.formState.errors?.color?.message}
              </FormMessage>
            </div>

            {/* Form Actions */}
            <FormActions
              onCancel={handleCancel}
              submitText="Update Product"
              isSubmitting={isSubmitting}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

