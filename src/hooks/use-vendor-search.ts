import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type SearchResult = {
  id: string | number;
  title: string;
  type: 'product' | 'order' | 'customer';
  path: string;
  description?: string;
  thumbnail?: string;
};

export function useVendorSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would call your API endpoints
      // For now, we'll use mock data
      
      // Mock search results
      const mockResults: SearchResult[] = [
        { 
          id: 1, 
          title: 'Blue Summer Dress', 
          type: 'product', 
          path: '/products/1',
          description: 'Elegant summer dress in light blue',
          thumbnail: 'https://via.placeholder.com/50'
        },
        { 
          id: 2, 
          title: 'Order #12345', 
          type: 'order', 
          path: '/orders/12345',
          description: 'Order placed on 2023-05-15'
        },
        { 
          id: 3, 
          title: 'Customer John Doe', 
          type: 'customer', 
          path: '/customers/1',
          description: 'Customer since 2023-01-10'
        },
      ];
      
      // Filter results based on query
      const filteredResults = mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        (result.description && result.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to perform search');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    handleSearchSelect,
  };
} 