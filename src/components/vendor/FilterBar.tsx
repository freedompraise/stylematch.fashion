import React from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type FilterOption = {
  label: string;
  value: string;
};

export type FilterConfig = {
  id: string;
  label: string;
  type: 'select' | 'range' | 'checkbox';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
};

interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className }: FilterBarProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Collapsible>
        <CollapsibleContent className="mt-2 space-y-4 rounded-md border p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Example Select Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Example Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-24"
                />
                <span>to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-24"
                />
              </div>
            </div>

            {/* Example Checkbox Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Size</label>
              <div className="space-y-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <div key={size} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`size-${size}`}
                      className="mr-2 h-4 w-4 rounded border-border"
                    />
                    <label htmlFor={`size-${size}`} className="text-sm">{size}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button>Apply Filters</Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}