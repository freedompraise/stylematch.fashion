import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Settings,
  Search,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { useSession } from '@/contexts/SessionContext';
import { useVendorSearch } from '@/hooks/use-vendor-search';

const navigationItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    title: 'Products',
    icon: Package,
    path: '/products',
    subItems: [
      { title: 'All Products', path: '/products' },
      { title: 'Dresses', path: '/products/dresses' },
      { title: 'Tops', path: '/products/tops' },
      { title: 'Bottoms', path: '/products/bottoms' },
      { title: 'Accessories', path: '/products/accessories' }
    ]
  },
  { title: 'Orders', icon: ShoppingCart, path: '/orders' },
  { title: 'Customers', icon: Users, path: '/customers' },
  { title: 'Payments', icon: CreditCard, path: '/payments' },
  { title: 'Settings', icon: Settings, path: '/settings' }
];

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const navigate = useNavigate();
  const { session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    handleSearchSelect
  } = useVendorSearch();

  const handleSearchOpenChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar className="border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground">
          <SidebarHeader className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="text-xl font-bricolage font-bold text-primary">
              StyleMatch
            </Link>
            <SidebarTrigger className="lg:hidden" />
          </SidebarHeader>
          <SidebarContent className="flex flex-col gap-2 p-4">
            {navigationItems.map((item) => (
              <div key={item.path} className="flex flex-col">
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
                {item.subItems && (
                  <div className="ml-6 mt-1 flex flex-col gap-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={cn(
                          'rounded-md px-3 py-1.5 text-sm transition-colors',
                          location.pathname === subItem.path
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-sidebar-accent/50'
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b px-4 bg-white">
            <SidebarTrigger className="lg:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search...</span>
            </Button>
          </header>

          <main className="flex-1 overflow-y-auto px-6 py-4 w-full max-w-screen-2xl mx-auto">
            {children}
          </main>
        </div>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={handleSearchOpenChange}>
        <CommandInput
          placeholder="Search products, orders, customers..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>
          )}
          {error && (
            <div className="py-6 text-center text-sm text-destructive">{error}</div>
          )}
          {!isLoading && !error && searchResults.length === 0 && searchQuery && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {searchResults.map((result) => (
            <CommandItem
              key={result.id}
              onSelect={() => handleSearchSelect(result.path)}
            >
              <span>{result.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {result.type}
              </span>
            </CommandItem>
          ))}
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}
