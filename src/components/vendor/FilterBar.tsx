import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
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

export type FilterValue = {
  [key: string]: string | number | boolean | [number, number];
};

interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: FilterValue;
  onFilterChange: (filters: FilterValue) => void;
  className?: string;
}

export function FilterBar({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  className 
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterValue>(activeFilters);

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...localFilters, [filterId]: value };
    setLocalFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    const emptyFilters: FilterValue = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Count active filters
  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={resetFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent className="mt-2 space-y-4 rounded-md border p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium">{filter.label}</label>
                
                {filter.type === 'select' && filter.options && (
                  <Select
                    value={String(localFilters[filter.id] || '')}
                    onValueChange={(value) => handleFilterChange(filter.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {filter.type === 'range' && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                      value={Array.isArray(localFilters[filter.id]) 
                        ? (localFilters[filter.id] as [number, number])[0] 
                        : filter.min}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const currentRange = Array.isArray(localFilters[filter.id]) 
                          ? localFilters[filter.id] as [number, number] 
                          : [value, filter.max || 100];
                        handleFilterChange(filter.id, [value, currentRange[1]]);
                      }}
                      className="w-24"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                      value={Array.isArray(localFilters[filter.id]) 
                        ? (localFilters[filter.id] as [number, number])[1] 
                        : filter.max}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        const currentRange = Array.isArray(localFilters[filter.id]) 
                          ? localFilters[filter.id] as [number, number] 
                          : [filter.min || 0, value];
                        handleFilterChange(filter.id, [currentRange[0], value]);
                      }}
                      className="w-24"
                    />
                  </div>
                )}
                
                {filter.type === 'checkbox' && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${filter.id}-${option.value}`}
                          checked={Array.isArray(localFilters[filter.id]) 
                            ? (localFilters[filter.id] as string[]).includes(option.value)
                            : false}
                          onChange={(e) => {
                            const currentValues = Array.isArray(localFilters[filter.id]) 
                              ? localFilters[filter.id] as string[] 
                              : [];
                            
                            if (e.target.checked) {
                              handleFilterChange(filter.id, [...currentValues, option.value]);
                            } else {
                              handleFilterChange(
                                filter.id, 
                                currentValues.filter(v => v !== option.value)
                              );
                            }
                          }}
                          className="mr-2 h-4 w-4 rounded border-gray-300"
                        />
                        <label 
                          htmlFor={`${filter.id}-${option.value}`}
                          className="text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
} 