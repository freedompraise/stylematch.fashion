import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBuyerStore, useMarketplaceStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Heart, ChevronDown } from 'lucide-react';

const ProductDetailContent: React.FC<{ vendorSlug: string; productId: string }> = ({ vendorSlug, productId }) => {
  const { currentVendor: vendor, listings: products, loading, error, fetchVendorData } = useMarketplaceStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { addToCart } = useBuyerStore();
  
  useEffect(() => {
    fetchVendorData(vendorSlug);
  }, [vendorSlug, fetchVendorData]);


  useEffect(() => {
    if (!loading && products.length > 0) {
      const p = products.find(prod => prod.id === productId);
      if (p) {
        setSelectedSize(Array.isArray(p.size) ? p.size[0] : '');
        setSelectedColor(Array.isArray(p.color) ? p.color[0] : '');
      }
    }
  }, [loading, products, productId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  if (!vendor) return null;
  const product = products.find(prod => prod.id === productId);
  if (!product) return <div className="min-h-screen flex items-center justify-center text-destructive">Product not found</div>;

  // Image navigation functions
  const goToNextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => 
      prev < product.images.length - 1 ? prev + 1 : 0
    );
  };

  const goToPreviousImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : product.images.length - 1
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextImage();
    } else if (isRightSwipe) {
      goToPreviousImage();
    }
  };

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!product?.images || product.images.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPreviousImage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNextImage();
      }
    };

    if (product) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [product, currentImageIndex]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.images) ? product.images[0] : '',
      quantity,
      size: selectedSize,
      color: selectedColor,
      vendor_slug: vendorSlug,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center">
          <div 
            className="aspect-square w-full max-w-md overflow-hidden rounded-lg mb-4 relative group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={Array.isArray(product.images) ? product.images[currentImageIndex] : ''} 
              alt={product.name} 
              className="w-full h-full object-cover transition-opacity duration-300" 
            />
            
            {/* Navigation Arrows */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPreviousImage();
                  }}
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </>
            )}
            
            {/* Image Counter */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            )}
            
            {/* Swipe Indicator for Mobile */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
                <div className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground">
                  Swipe to view more
                </div>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {Array.isArray(product.images) && product.images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`w-20 h-20 rounded-md overflow-hidden border cursor-pointer transition-all ${
                    index === currentImageIndex 
                      ? 'border-primary ring-2 ring-primary/20 scale-105' 
                      : 'hover:border-primary hover:scale-105'
                  }`}
                  onClick={() => selectImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-baseContent-secondary mb-2">{product.category}</p>
          <h2 className="text-2xl font-bold text-primary mb-4">₦{product.price.toLocaleString()}</h2>
          <p className="mb-6">{product.description}</p>
          {Array.isArray(product.size) && product.size.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Size</h4>
              <div className="flex flex-wrap gap-2">
                {product.size.map((size: string) => (
                  <button
                    key={size}
                    className={`border rounded-md px-4 py-2 text-sm transition-colors ${selectedSize === size ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(product.color) && product.color.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Color</h4>
              <div className="flex flex-wrap gap-2">
                {product.color.map((color: string) => (
                  <button
                    key={color}
                    className={`border rounded-md px-4 py-2 text-sm transition-colors ${selectedColor === color ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary'}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mb-6">
            <label htmlFor="quantity" className="font-semibold">Qty</label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-16 border rounded px-2 py-1"
            />
          </div>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={handleAddToCart}>Add to Cart</Button>
            <Button variant="outline" size="icon"><Heart size={20} /></Button>
          </div>
        </div>
      </div>
      <div className="mt-8 max-w-4xl w-full">
        <h3 className="text-xl font-bold mb-2">About {vendor.store_name}</h3>
        <p className="text-baseContent-secondary mb-2">{vendor.bio}</p>
        <div className="flex gap-4 items-center mb-4">
          {vendor.instagram_url && <a href={vendor.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Instagram</a>}
          {vendor.facebook_url && <a href={vendor.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook</a>}
          {vendor.wabusiness_url && <a href={vendor.wabusiness_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a>}
        </div>
      </div>
    </div>
  );
};

const ProductDetail: React.FC = () => {
  const { vendorSlug, productId } = useParams();
  if (!vendorSlug || !productId) return <div>Invalid product URL</div>;
  return <ProductDetailContent vendorSlug={vendorSlug} productId={productId} />;
};

export default ProductDetail; 