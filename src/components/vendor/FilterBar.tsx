
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: {
    [key: string]: FilterOption[];
  };
  onFilterChange: (filter: string, value: string) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>
      </div>
      
      {Object.entries(filters).map(([filterName, options]) => (
        <div key={filterName} className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            onChange={(e) => onFilterChange(filterName, e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              {filterName}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      
      <Button variant="outline" size="sm" className="ml-auto">
        Clear Filters
      </Button>
    </div>
  );
}
