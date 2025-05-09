import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color?: string;
  bgColor?: string;
};

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {actions.map((action) => (
        <Link 
          key={action.id} 
          to={action.path}
          className="block"
        >
          <div 
            className={cn(
              "flex h-full flex-col rounded-lg border p-4 transition-colors hover:bg-accent",
              action.bgColor
            )}
          >
            <div className="flex items-center gap-3">
              <div 
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  action.color || "bg-primary/10 text-primary"
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{action.title}</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Predefined quick actions for different sections
export const dashboardQuickActions: QuickAction[] = [
  {
    id: 'add-product',
    title: 'Add Product',
    description: 'Create a new product listing',
    icon: ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    path: '/products/new',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'view-orders',
    title: 'View Orders',
    description: 'See your recent orders',
    icon: ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
      </svg>
    ),
    path: '/orders',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'low-stock',
    title: 'Low Stock Alert',
    description: 'Items that need restocking',
    icon: ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    path: '/products/low-stock',
    color: 'bg-red-100 text-red-600',
  },
];

export const productsQuickActions: QuickAction[] = [
  {
    id: 'add-product',
    title: 'Add Product',
    description: 'Create a new product listing',
    icon: ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    path: '/products/new',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'trending',
    title: 'Trending Products',
    description: 'View your best-selling items',
    icon: ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="m23 3-7.5 7.5L13 8l-6 6-4-4-6 6" />
      </svg>
    ),
    path: '/products/trending',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'low-stock',
    title: 'Low Stock Alert',
    description: 'Items that need restocking',
    icon: ({ className }: { className?: string }) => (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    path: '/products/low-stock',
    color: 'bg-red-100 text-red-600',
  },
]; 
