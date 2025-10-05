import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Filter, 
  ChevronDown, 
  User,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Share2,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Logo from '@/components/Logo';
import VendorNotFound from '@/components/buyer/VendorNotFound';
import { useMarketplaceStore, useBuyerStore } from '@/stores';
import { toast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';
import { getAllCategoryNames, getCategoryName } from '@/constants/categories';
import { shareProduct, getVendorContactMethod, getProductRatings } from '@/services/buyerStorefrontService';

const categories = [
  'All Categories', 
  ...getAllCategoryNames()
];


const StorefrontContent: React.FC<{ vendorSlug: string }> = ({ vendorSlug }) => {
  const { currentVendor: vendor, listings: products, loading, error, fetchVendorData } = useMarketplaceStore();
  const { 
    cart: cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    getTotal, 
    clearCart,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  } = useBuyerStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchVendorData(vendorSlug);
  }, [vendorSlug, fetchVendorData]);

  // Fetch product ratings when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      getProductRatings(productIds).then(ratings => {
        setProductRatings(ratings);
      }).catch(error => {
        console.error('Error fetching product ratings:', error);
      });
    }
  }, [products]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [productRatings, setProductRatings] = useState<Record<string, { average_rating: number; review_count: number }>>({});
  const navigate = useNavigate();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCategoryName(product.category).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || 
                           product.category === selectedCategory ||
                           getCategoryName(product.category) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setSelectedSize(Array.isArray(product.size) ? product.size[0] : '');
    setSelectedColor(Array.isArray(product.color) ? product.color[0] : '');
    setSelectedQuantity(1);
  };
  
  const addToCartHandler = () => {
    if (!selectedProduct) return;
    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: Array.isArray(selectedProduct.images) ? selectedProduct.images[0] : '',
      quantity: selectedQuantity,
      size: selectedSize,
      color: selectedColor,
      vendor_slug: vendorSlug,
    });
    toast.cart.addSuccess(selectedProduct.name);
    setSelectedProduct(null);
  };

  const toggleWishlist = (product: any) => {
    if (!vendor) return;
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.wishlist.removeSuccess(product.name);
    } else {
      addToWishlist({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.images) ? product.images[0] : '',
        vendorSlug: vendorSlug,
        vendorName: vendor.store_name,
      });
      toast.wishlist.addSuccess(product.name);
    }
  };

  const handleShare = async (product: any) => {
    if (!vendor) return;
    
    try {
      await shareProduct(product, vendor, 'native');
      toast.general.shareSuccess();
    } catch (error) {
      // Fallback to copy link
      try {
        await shareProduct(product, vendor, 'copy');
        toast.general.linkCopied();
      } catch (copyError) {
        toast.general.shareError();
      }
    }
  };
  
  const updateCartItemQuantity = (index: number, change: number) => {
    const item = cartItems[index];
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty < 1) return;
    updateQuantity(item.id, newQty, item.size, item.color);
  };
  
  const removeCartItem = (index: number) => {
    const item = cartItems[index];
    if (!item) return;
    removeFromCart(item.id, item.size, item.color);
    toast.cart.removeSuccess(item.name);
  };
  
  const cartTotal = getTotal();
  
  // Get vendor contact method for "Chat Now" button
  const contactMethod = vendor ? getVendorContactMethod(vendor) : null;

  // Helper function to get product rating
  const getProductRating = (productId: string) => {
    const rating = productRatings[productId];
    return {
      average: rating?.average_rating || 0,
      count: rating?.review_count || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg">Loading store...</span>
      </div>
    );
  }

  if (!vendor) {
    return <VendorNotFound vendorSlug={vendorSlug} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header with Gradient Background */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 z-50">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <Logo />
            
            {/* Enhanced Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search products, categories..." 
                  className="pl-10 pr-4 py-2 bg-muted/50 border-border/50 focus:bg-background transition-colors" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative">
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart size={20} />
                    {cartItems.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                        {cartItems.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingCart size={20} />
                      Your Shopping Bag
                    </SheetTitle>
                  </SheetHeader>
                  
                  {cartItems.length > 0 ? (
                    <>
                      <div className="flex-1 overflow-y-auto py-6 space-y-4">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                              <p className="text-xs text-muted-foreground mb-2">₦{item.price.toLocaleString()}</p>
                              
                              {(item.size || item.color) && (
                                <div className="text-xs text-muted-foreground mb-2">
                                  {item.size && <span>Size: {item.size}</span>}
                                  {item.size && item.color && <span> • </span>}
                                  {item.color && <span>Color: {item.color}</span>}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border border-border rounded-md">
                                  <button 
                                    className="p-1 hover:bg-muted transition-colors" 
                                    onClick={() => updateCartItemQuantity(index, -1)}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="px-2 text-sm">{item.quantity}</span>
                                  <button 
                                    className="p-1 hover:bg-muted transition-colors" 
                                    onClick={() => updateCartItemQuantity(index, 1)}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <button 
                                  type="button" 
                                  className="text-destructive hover:text-destructive/80 p-1"
                                  onClick={() => removeCartItem(index)}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-border pt-4 space-y-4">
                        <div className="flex justify-between text-base font-semibold">
                          <span>Subtotal</span>
                          <span>₦{cartTotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Shipping and taxes calculated at checkout
                        </p>
                        <Button className="w-full" onClick={() => navigate(`/store/${vendorSlug}/checkout`)}>
                          Proceed to Checkout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag size={24} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Your bag is empty</h3>
                      <p className="text-muted-foreground mb-6 text-sm">
                        Looks like you haven't added any items to your bag yet.
                      </p>
                      <SheetClose asChild>
                        <Button>Start Shopping</Button>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-muted/50 border-border/50" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>
      

      
      {/* Hero Section with Banner */}
      {vendor.banner_image_url && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={vendor.banner_image_url}
            alt={`${vendor.store_name} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      )}

      <main className="container mx-auto py-8 px-4">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Store Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-foreground mb-2">{vendor.store_name}</h1>
                <p className="text-muted-foreground text-lg">{vendor.bio}</p>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-3 items-center">
                {vendor.instagram_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={vendor.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Instagram size={16} />
                      Instagram
                    </a>
                  </Button>
                )}
                {vendor.facebook_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={vendor.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Facebook size={16} />
                      Facebook
                    </a>
                  </Button>
                )}
                {vendor.wabusiness_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={vendor.wabusiness_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <MessageCircle size={16} />
                      WhatsApp
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share2 size={16} />
                  Share
                </Button>
              </div>
            </div>
            
            {/* Store Stats & Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
              <div className="flex gap-4 text-center">
                <div className="px-4 py-2 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">{products.length}</div>
                  <div className="text-xs text-muted-foreground">Products</div>
                </div>
                <div className="px-4 py-2 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold text-foreground">4.8</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>
              
              {/* Chat Now Button */}
              {contactMethod && contactMethod.method && (
                <Button 
                  asChild
                  className="w-full sm:w-auto lg:w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <a 
                    href={contactMethod.url} 
                    target={contactMethod.method === 'phone' ? '_self' : '_blank'}
                    rel={contactMethod.method === 'phone' ? '' : 'noopener noreferrer'}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle size={16} />
                    {contactMethod.label}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter size={16} />
              <span>Filters</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
        
        {/* Modern Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-border"
              onClick={() => handleProductSelect(product)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={product.images?.[0] || ''} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className={`h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background ${
                      isInWishlist(product.id) ? 'text-red-500' : 'text-muted-foreground hover:text-primary'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                  >
                    <Heart 
                      size={14} 
                      className={isInWishlist(product.id) ? 'fill-current' : ''} 
                    />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(product);
                    }}
                  >
                    <Share2 size={14} className="text-muted-foreground hover:text-primary" />
                  </Button>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                  <Button 
                    className="flex-1 bg-primary/90 backdrop-blur-sm hover:bg-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart and redirect to checkout
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: Array.isArray(product.images) ? product.images[0] : '',
                        quantity: 1,
                        size: Array.isArray(product.size) ? product.size[0] : '',
                        color: Array.isArray(product.color) ? product.color[0] : '',
                        vendor_slug: vendorSlug,
                      });
                      navigate(`/store/${vendorSlug}/checkout`);
                    }}
                  >
                    Buy Now
                  </Button>
                  <Button 
                    variant="secondary"
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductSelect(product);
                    }}
                  >
                    Details
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {getCategoryName(product.category)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  {/* <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-muted-foreground">
                      {getProductRating(product.id).average > 0 
                        ? `${getProductRating(product.id).average} (${getProductRating(product.id).count})`
                        : 'No ratings'
                      }
                    </span>
                  </div> */}
                  <p className="font-bold text-primary text-lg">₦{product.price.toLocaleString()}</p>
                </div>
                
                {product.discount_price && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">₦{product.discount_price.toLocaleString()}</span>
                    <Badge variant="destructive" className="text-xs">
                      Sale
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
              <Button variant="outline" onClick={() => setSelectedCategory('All Categories')}>
                Show All Categories
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Product Details</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedProduct(null)}
                className="hover:bg-muted"
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Product Image */}
              <div className="relative aspect-square lg:aspect-auto lg:h-[70vh] overflow-hidden">
                <img 
                  src={selectedProduct.images?.[0] || ''} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-contain cursor-zoom-in"
                  onClick={() => {
                    const url = selectedProduct.images?.[0] || '';
                    if (url) window.open(url, '_blank');
                  }}
                />
                {selectedProduct.discount_price && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                    Sale
                  </Badge>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-6 lg:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {getCategoryName(selectedProduct.category)}
                    </Badge>
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-4">
                      {/* <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          {getProductRating(selectedProduct.id).average > 0 
                            ? `${getProductRating(selectedProduct.id).average} (${getProductRating(selectedProduct.id).count} reviews)`
                            : 'No ratings yet'
                          }
                        </span>
                      </div> */}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-primary">
                        ₦{selectedProduct.price.toLocaleString()}
                      </span>
                      {selectedProduct.discount_price && (
                        <span className="text-lg text-muted-foreground line-through">
                          ₦{selectedProduct.discount_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                  
                  {/* Size Selection */}
                  {Array.isArray(selectedProduct.size) && selectedProduct.size.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Size</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.size.map((size: string) => (
                          <button
                            key={size}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedSize === size 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Color Selection */}
                  {Array.isArray(selectedProduct.color) && selectedProduct.color.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Color</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.color.map((color: string) => (
                          <button
                            key={color}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              selectedColor === color 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            onClick={() => setSelectedColor(color)}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selection */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Quantity</h4>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                        disabled={selectedQuantity <= 1}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-12 text-center font-medium">{selectedQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3 pt-6 border-t border-border">
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 h-12 text-base font-semibold bg-primary" 
                      onClick={() => {
                        // Add to cart and redirect to checkout
                        addToCart({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: selectedProduct.price,
                          image: Array.isArray(selectedProduct.images) ? selectedProduct.images[0] : '',
                          quantity: selectedQuantity,
                          size: selectedSize || (Array.isArray(selectedProduct.size) ? selectedProduct.size[0] : ''),
                          color: selectedColor || (Array.isArray(selectedProduct.color) ? selectedProduct.color[0] : ''),
                          vendor_slug: vendorSlug,
                        });
                        navigate(`/store/${vendorSlug}/checkout`);
                      }}
                    >
                      Buy Now ({selectedQuantity})
                    </Button>
                    <Button 
                      className="flex-1 h-12 text-base font-semibold" 
                      variant="outline"
                      onClick={addToCartHandler}
                    >
                      Add to Cart
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${isInWishlist(selectedProduct.id) ? 'text-red-500 border-red-500' : ''}`}
                      size="lg"
                      onClick={() => toggleWishlist(selectedProduct)}
                    >
                      <Heart 
                        size={18} 
                        className={`mr-2 ${isInWishlist(selectedProduct.id) ? 'fill-current' : ''}`} 
                      />
                      {isInWishlist(selectedProduct.id) ? 'In Wishlist' : 'Add to Wishlist'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      size="lg"
                      onClick={() => handleShare(selectedProduct)}
                    >
                      <Share2 size={18} className="mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="bg-foreground text-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Logo className="brightness-0 invert mb-4" />
              <p className="text-foreground/80 mb-4">
                The finest selection of fashion items for your unique style.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Home</a></li>
                <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Shop All</a></li>
                <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">New Arrivals</a></li>
                <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="text-foreground/80 hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="text-foreground/80 mb-2">support@stylematch.com</p>
              <p className="text-foreground/80">+234 812 345 6789</p>
              
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-foreground/10 p-2 rounded-full hover:bg-foreground/20 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="bg-foreground/10 p-2 rounded-full hover:bg-foreground/20 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="bg-foreground/10 p-2 rounded-full hover:bg-foreground/20 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-foreground/10 text-center sm:text-left">
            <p className="text-foreground/60">© 2025 Stylematch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Storefront: React.FC = () => {
  const { vendorSlug } = useParams();
  if (!vendorSlug) return <div>Invalid store URL</div>;
  return <StorefrontContent vendorSlug={vendorSlug} />;
};

export default Storefront;
