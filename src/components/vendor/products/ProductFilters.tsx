import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getCategoryOptions } from '@/constants/categories';
import { Search, Filter } from 'lucide-react';
import { ProductFilters as FilterType } from '@/utils/productFiltering';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterType) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = React.useState<FilterType>({
    search: '',
    category: 'all',
    priceRange: 'all',
    stockStatus: 'all',
  });

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterType = {
      search: '',
      category: 'all',
      priceRange: 'all',
      stockStatus: 'all',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {getCategoryOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priceRange}
          onValueChange={(value) => handleFilterChange('priceRange', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-5000">₦0 - ₦5,000</SelectItem>
            <SelectItem value="5001-15000">₦5,001 - ₦15,000</SelectItem>
            <SelectItem value="15001-30000">₦15,001 - ₦30,000</SelectItem>
            <SelectItem value="30001-50000">₦30,001 - ₦50,000</SelectItem>
            <SelectItem value="50001+">₦50,001+</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.stockStatus}
          onValueChange={(value) => handleFilterChange('stockStatus', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in-stock">In Stock</SelectItem>
            <SelectItem value="low-stock">Low Stock</SelectItem>
            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleReset}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
} 