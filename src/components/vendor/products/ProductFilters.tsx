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
import { Search, Filter } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search: string;
    category: string;
    priceRange: string;
    stockStatus: string;
  }) => void;
}

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = React.useState({
    search: '',
    category: '',
    priceRange: '',
    stockStatus: '',
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
    setFilters({
      search: '',
      category: '',
      priceRange: '',
      stockStatus: '',
    });
    onFilterChange({
      search: '',
      category: '',
      priceRange: '',
      stockStatus: '',
    });
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
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="tops">Tops</SelectItem>
            <SelectItem value="bottoms">Bottoms</SelectItem>
            <SelectItem value="dresses">Dresses</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
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
            <SelectItem value="">All Prices</SelectItem>
            <SelectItem value="0-50">$0 - $50</SelectItem>
            <SelectItem value="51-100">$51 - $100</SelectItem>
            <SelectItem value="101-200">$101 - $200</SelectItem>
            <SelectItem value="201+">$201+</SelectItem>
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
            <SelectItem value="">All Status</SelectItem>
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