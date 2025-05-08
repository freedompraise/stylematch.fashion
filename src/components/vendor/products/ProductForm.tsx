import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ProductImageUpload } from './ProductImageUpload';
import { ProductFormFields } from './ProductFormFields';
import { Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0, 'Stock must be greater than or equal to 0'),
  isDiscounted: z.boolean().default(false),
  discountPercentage: z.number().min(0).max(100).optional(),
  isHottestOffer: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData & { images: File[] }) => Promise<void>;
  onCancel: () => void;
  categories: string[];
  sizes: string[];
  colors: string[];
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  categories,
  sizes,
  colors,
}: ProductFormProps) {
  const [images, setImages] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      size: product?.size || '',
      color: product?.color || '',
      stock: product?.stock || 0,
      isDiscounted: product?.isDiscounted || false,
      discountPercentage: product?.discountPercentage || 0,
      isHottestOffer: product?.isHottestOffer || false,
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (images.length === 0 && !product) {
        toast({
          title: 'Error',
          description: 'Please upload at least one product image',
          variant: 'destructive',
        });
        return;
      }

      await onSubmit({ ...data, images });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <ProductImageUpload
          onImagesChange={setImages}
          previewUrls={previewUrls}
          onPreviewUrlsChange={setPreviewUrls}
          maxImages={5}
        />

        <ProductFormFields
          categories={categories}
          sizes={sizes}
          colors={colors}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {product ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
} 