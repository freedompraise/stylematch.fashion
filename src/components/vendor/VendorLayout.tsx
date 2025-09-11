// VendorLayout.tsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Settings,
  Search,
  Menu,
  LogOut
} from 'lucide-react';
import { useVendorStore, useAuthStore } from '@/stores';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useVendorSearch } from '@/hooks/use-vendor-search';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import SupportChat from '@/components/SupportChat';

const navigationItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/vendor/dashboard' },
  {
    title: 'Products',
    icon: Package,
    path: '/vendor/products',
    subItems: [{ title: 'All Products', path: '/vendor/products' }]
  },
  { title: 'Orders', icon: ShoppingCart, path: '/vendor/orders' },
  // { title: 'Customers', icon: Users, path: '/customers' },
  // { title: 'Payments', icon: CreditCard, path: '/payments' },
  {
    title: 'Settings',
    icon: Settings,
    path: '/vendor/settings',
    subItems: [
      { title: 'Profile', path: '/vendor/settings' },
      { title: 'Store', path: '/vendor/settings/store' },
      { title: 'Payout', path: '/vendor/settings/payout' },
      { title: 'Danger Zone', path: '/vendor/settings/danger' },
    ]
  }
];

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { vendor, clearVendorData } = useVendorStore();
  const { signOut } = useAuthStore();
  const { toast } = useToast();

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

  const handleSignOut = async () => {
    try {
      await signOut();
      clearVendorData();
      toast({
        title: 'Signed out',
        description: 'You have successfully signed out.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await handleSignOut();
  };

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <Sidebar className="border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground">
            <SidebarHeader className="flex h-16 items-center px-4 border-b border-sidebar-border">
              <Link
                to="/vendor/dashboard"
                className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-sidebar-accent/50"
              >
                <span className="text-base font-bricolage font-bold leading-none">StyleMatch</span>
              </Link>
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
            <header className="flex h-16 items-center justify-between border-b px-4 bg-background">            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search...</span>
              </Button> */}
              {vendor && (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <div className="font-medium">{vendor.store_name}</div>
                    <div className="text-muted-foreground text-xs">{vendor.name}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogoutClick}
                    className="hover:bg-destructive/10"
                  >
                    <LogOut className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
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

        <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign Out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? You will need to sign in again to access your vendor dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmLogout}>
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarProvider>
      <SupportChat />
    </>
  );
}
