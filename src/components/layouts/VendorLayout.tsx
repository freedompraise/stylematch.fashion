import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings, 
  Search, 
  Menu, 
  X, 
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Plus
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useSession } from '@/contexts/SessionContext';
import { useVendorSearch } from '@/hooks/use-vendor-search';

// Navigation items with their sub-items
const navigationItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Products',
    icon: Package,
    path: '/products',
    subItems: [
      { title: 'All Products', path: '/products' },
      { title: 'Dresses', path: '/products/dresses' },
      { title: 'Tops', path: '/products/tops' },
      { title: 'Bottoms', path: '/products/bottoms' },
      { title: 'Accessories', path: '/products/accessories' },
    ],
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    path: '/orders',
  },
  {
    title: 'Customers',
    icon: Users,
    path: '/customers',
  },
  {
    title: 'Payments',
    icon: CreditCard,
    path: '/payments',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

// Quick action items
const quickActions = [
  {
    title: 'Restock Now',
    icon: AlertCircle,
    color: 'text-red-500',
    path: '/products/low-stock',
  },
  {
    title: 'View Trending',
    icon: TrendingUp,
    color: 'text-green-500',
    path: '/products/trending',
  },
  {
    title: 'Add Product',
    icon: Plus,
    color: 'text-blue-500',
    path: '/products/new',
  },
];

interface VendorLayoutProps {
  children: React.ReactNode;
}

export default function VendorLayout({ children }: VendorLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Use the custom search hook
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    isLoading, 
    error, 
    handleSearchSelect 
  } = useVendorSearch();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const isLast = index === paths.length - 1;
      const title = path.charAt(0).toUpperCase() + path.slice(1);
      
      return {
        href,
        title,
        isLast,
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  // Handle search dialog open/close
  const handleSearchOpenChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground">
          <SidebarHeader className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bricolage font-bold text-primary">StyleMatch</span>
            </Link>
            <SidebarTrigger className="lg:hidden" />
          </SidebarHeader>
          <SidebarContent className="flex flex-col gap-2 p-4">
            {navigationItems.map((item) => (
              <div key={item.path} className="flex flex-col">
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
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
                          "rounded-md px-3 py-1.5 text-sm transition-colors",
                          location.pathname === subItem.path
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "hover:bg-sidebar-accent/50"
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

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top navigation */}
          <header className="flex h-16 items-center justify-between border-b px-4 bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hidden lg:flex" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/dashboard">Home</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search...</span>
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
              <div className="flex items-center gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.path}
                    variant="ghost"
                    size="sm"
                    className={cn("hidden lg:flex", action.color)}
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Search dialog */}
      <CommandDialog open={searchOpen} onOpenChange={handleSearchOpenChange}>
        <CommandInput
          placeholder="Search products, orders, customers..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {error && (
            <div className="py-6 text-center text-sm text-destructive">
              {error}
            </div>
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
