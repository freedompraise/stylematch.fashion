import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';

interface VendorNotFoundProps {
  vendorSlug: string;
}

const VendorNotFound: React.FC<VendorNotFoundProps> = ({ vendorSlug }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background shadow-sm z-50">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <ShoppingBag size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon and Main Message */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Store Not Found</h1>
            <p className="text-lg text-muted-foreground mb-2">
              We couldn't find a store with the name "<span className="font-semibold text-foreground">{vendorSlug}</span>"
            </p>
            <p className="text-muted-foreground">
              This could be because the store name has changed, the store is no longer active, or there might be a typo in the URL.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Search for Stores */}
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Search size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Browse All Stores</h3>
              <p className="text-muted-foreground text-sm">
                Discover amazing fashion stores on StyleMatch
              </p>
            </Card>

            {/* Contact Support */}
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.open('mailto:support@stylematch.com?subject=Store Not Found&body=I was looking for a store with the name: ' + vendorSlug, '_blank')}>
              <div className="w-12 h-12 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Support</h3>
              <p className="text-muted-foreground text-sm">
                Get help finding the store you're looking for
              </p>
            </Card>
          </div>

          {/* Search Suggestions */}
          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Looking for something specific?</h3>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                placeholder="Search for stores or products..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    if (searchTerm.trim()) {
                      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
                    }
                  }
                }}
              />
              <Button onClick={() => {
                const input = document.querySelector('input[placeholder="Search for stores or products..."]') as HTMLInputElement;
                if (input?.value.trim()) {
                  navigate(`/?search=${encodeURIComponent(input.value.trim())}`);
                }
              }}>
                Search
              </Button>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Popular Categories</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {['Clothing', 'Shoes', 'Accessories', 'Bags', 'Jewelry'].map((category) => (
                <Button 
                  key={category}
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/?category=${encodeURIComponent(category)}`)}
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Back to Home */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} className="px-8">
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="px-8">
              Go Back
            </Button>
          </div>
        </div>
      </main>

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

export default VendorNotFound;
