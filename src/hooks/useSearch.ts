
import { useState, useCallback, useEffect } from 'react';

export interface SearchConfig<T> {
  items: T[];
  searchableFields: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T>({ items, searchableFields, debounceMs = 300 }: SearchConfig<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(items);

  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(items);
      return;
    }

    const filtered = items.filter((item) =>
      searchableFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );

    setResults(filtered);
  }, [items, searchableFields]);

  useEffect(() => {
    const handler = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, search, debounceMs]);

  return {
    query,
    setQuery,
    results,
  };
}
