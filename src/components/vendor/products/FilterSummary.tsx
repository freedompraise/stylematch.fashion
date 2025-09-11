// src/components/vendor/products/FilterSummary.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ProductFilters, getFilterSummary } from '@/utils/productFiltering';
import { getCategoryName } from '@/constants/categories';

interface FilterSummaryProps {
  filters: ProductFilters;
  totalProducts: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function FilterSummary({ 
  filters, 
  totalProducts, 
  filteredCount, 
  onClearFilters 
}: FilterSummaryProps) {
  const { activeFilters, hasActiveFilters, summary, clearText } = getFilterSummary(
    filters, 
    totalProducts, 
    filteredCount
  );

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Active filters:</span>
        {activeFilters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {filter}
          </Badge>
        ))}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-sm text-muted-foreground">{summary}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-6 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          {clearText}
        </Button>
      </div>
    </div>
  );
}
