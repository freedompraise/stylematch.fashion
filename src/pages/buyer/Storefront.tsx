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
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { useMarketplaceStore, useBuyerStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getAllCategoryNames, getCategoryName } from '@/constants/categories';

const categories = [
  'All Categories', 
  ...getAllCategoryNames()
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

const StorefrontContent: React.FC<{ vendorSlug: string }> = ({ vendorSlug }) => {
  const { currentVendor: vendor, listings: products, loading, error, fetchVendorData } = useMarketplaceStore();
  const { cart: cartItems, addToCart, removeFromCart, updateQuantity, getTotal, clearCart } = useBuyerStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchVendorData(vendorSlug);
  }, [vendorSlug, fetchVendorData]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const { toast } = useToast();
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
  };
  
  const addToCartHandler = () => {
    if (!selectedProduct) return;
    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: Array.isArray(selectedProduct.images) ? selectedProduct.images[0] : '',
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      vendor_slug: vendorSlug,
    });
    toast({ title: 'Added to Cart', description: `${selectedProduct.name} added to your cart.` });
    setSelectedProduct(null);
  };
  
  const updateCartItemQuantity = (index: number, change: number) => {
    const item = cartItems[index];
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty < 1) return;
    updateQuantity(item.id, newQty, item.size, item.color);
    toast({ title: 'Cart Updated', description: `${item.name} quantity updated.` });
  };
  
  const removeCartItem = (index: number) => {
    const item = cartItems[index];
    if (!item) return;
    removeFromCart(item.id, item.size, item.color);
    toast({ title: 'Removed from Cart', description: `${item.name} removed from your cart.` });
  };
  
  const cartTotal = getTotal();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg">Loading store...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-destructive">{error}</span>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg text-destructive">Vendor not found.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background shadow-sm z-50">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <Logo />
            
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  placeholder="Search for products..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <User size={20} />
              </Button>
              
              <Button variant="outline" size="icon">
                <Heart size={20} />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart size={20} />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cartItems.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Your Shopping Bag</SheetTitle>
                  </SheetHeader>
                  
                  {cartItems.length > 0 ? (
                    <>
                      <div className="flex-1 overflow-y-auto py-6 space-y-6">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div className="flex justify-between text-base font-medium text-baseContent">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="ml-4">₦{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                              
                              <div className="text-sm text-baseContent-secondary">
                                {item.size && <p>Size: {item.size}</p>}
                                {item.color && <p>Color: {item.color}</p>}
                              </div>
                              
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border rounded-md">
                                  <button 
                                    className="p-1 px-2" 
                                    onClick={() => updateCartItemQuantity(index, -1)}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="px-2">{item.quantity}</span>
                                  <button 
                                    className="p-1 px-2" 
                                    onClick={() => updateCartItemQuantity(index, 1)}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                <button 
                                  type="button" 
                                  className="text-destructive hover:text-destructive/80"
                                  onClick={() => removeCartItem(index)}
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-base font-medium text-baseContent mb-2">
                          <p>Subtotal</p>
                          <p>₦{cartTotal.toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-baseContent-secondary mb-6">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <Button className="w-full" onClick={() => navigate(`/store/${vendorSlug}/checkout`)}>Proceed to Checkout</Button>
                        <div className="mt-3 flex justify-center text-center text-sm text-baseContent-secondary">
                        
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[70vh]">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-baseContent mb-2">Your bag is empty</h3>
                      <p className="text-baseContent-secondary mb-6 text-center">
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
          
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search for products..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>
      

      
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-baseContent">{vendor.store_name}</h1>
              <p className="text-baseContent-secondary mt-1">{vendor.bio}</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter size={18} />
              </Button>
            </div>
          </div>
          {/* Vendor social links */}
          <div className="flex gap-4 items-center mb-4">
            {vendor.instagram_url && <a href={vendor.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Instagram</a>}
            {vendor.facebook_url && <a href={vendor.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook</a>}
            {vendor.wabusiness_url && <a href={vendor.wabusiness_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a>}
          </div>
        </div>

        {vendor.banner_image_url && (
        <div className="w-full h-48 md:h-64 lg:h-80 mb-16">
          <img
            src={vendor.banner_image_url}
            alt={`${vendor.store_name} banner`}
            className="w-full h-full object-contain"
          />
        </div>
      )}
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProductSelect(product)}
            >
              <div className="relative h-64 md:h-72">
                <img 
                  src={product.images?.[0] || ''} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Heart size={15} className="text-muted-foreground hover:text-primary" />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-baseContent truncate">{product.name}</h3>
                <p className="text-sm text-baseContent-secondary mb-2">{product.category}</p>
                <p className="font-bold text-primary">₦{product.price.toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-baseContent mb-1">No products found</h3>
            <p className="text-baseContent-secondary">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </main>
      
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 flex justify-end">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedProduct(null)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img 
                  src={selectedProduct.images?.[0] || ''} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-baseContent">{selectedProduct.name}</h2>
                <p className="text-sm text-baseContent-secondary mb-4">{selectedProduct.category}</p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-primary mb-2">₦{selectedProduct.price.toLocaleString()}</h3>
                  <p className="text-baseContent-secondary">{selectedProduct.description}</p>
                </div>
                
                {Array.isArray(selectedProduct.size) && selectedProduct.size.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.size.map((size: string) => (
                        <button
                          key={size}
                          className={`border rounded-md px-4 py-2 text-sm transition-colors ${
                            selectedSize === size 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'border-border hover:border-primary'
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {Array.isArray(selectedProduct.color) && selectedProduct.color.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.color.map((color: string) => (
                        <button
                          key={color}
                          className={`border rounded-md px-4 py-2 text-sm transition-colors ${
                            selectedColor === color 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'border-border hover:border-primary'
                          }`}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button className="flex-1" onClick={addToCartHandler}>
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart size={20} />
                  </Button>
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
