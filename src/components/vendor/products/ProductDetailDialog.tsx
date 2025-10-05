// src/components/vendor/products/ProductDetailDialog.tsx
import React from 'react';
import { X, Package, Tag, DollarSign, BarChart3, Calendar, Edit, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/types/ProductSchema';
import CloudinaryImage from '@/components/CloudinaryImage';

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
}

export function ProductDetailDialog({ 
  product, 
  open, 
  onOpenChange, 
  onEdit 
}: ProductDetailDialogProps) {
  if (!product) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= 5) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Product
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Header */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-80 h-80 rounded-lg overflow-hidden border cursor-zoom-in">
                {product.images && product.images.length > 0 ? (
                  <CloudinaryImage
                    publicId={product.images[0]}
                    width={320}
                    height={320}
                    className="w-full h-full object-contain"
                    alt={product.name}
                    onClick={() => window.open(product.images[0], '_blank')}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Additional Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {product.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border cursor-zoom-in">
                      <CloudinaryImage
                        publicId={image}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        alt={`${product.name} ${index + 2}`}
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                  {product.images.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{product.images.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <p className="text-muted-foreground mt-1">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={stockStatus.variant} className="text-sm">
                  {stockStatus.label}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {product.category}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold">₦{product.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-semibold">{product.stock_quantity} units</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(product.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                  <p className="font-mono text-sm">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{product.category}</p>
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand</p>
                  <p className="text-sm">{product.brand || 'Not specified'}</p>
                </div> */}
                {/* <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU</p>
                  <p className="text-sm">{product.sku || 'Not specified'}</p>
                </div> */}
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">₦{product.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Quantity</p>
                  <p className="text-sm">{product.stock_quantity} units</p>
                </div>
                {/* <div>
                  <p className="text-sm font-medium text-muted-foreground">Minimum Order</p>
                  <p className="text-sm">{product.minimum_order || 'No minimum'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Weight</p>
                  <p className="text-sm">{product.weight || 'Not specified'}</p>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Product Description */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Product Tags */}
          {/* {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(product.created_at)}</p>
              </div>
              {product.updated_at && product.updated_at !== product.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDate(product.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
