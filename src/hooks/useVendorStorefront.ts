import { useEffect, useState } from 'react';
import { getVendorBySlug, getProductsByVendorSlug } from '@/services/buyerStorefrontService';
import { VendorProfile, Product } from '@/types';

export function useVendorStorefront(vendorSlug: string) {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setVendor(null);
    setProducts([]);
    (async () => {
      const v = await getVendorBySlug(vendorSlug);
      if (!isMounted) return;
      if (!v) {
        setError('Vendor not found');
        setLoading(false);
        return;
      }
      setVendor(v);
      const p = await getProductsByVendorSlug(vendorSlug);
      if (!isMounted) return;
      setProducts(p);
      setLoading(false);
    })();
    return () => { isMounted = false; };
  }, [vendorSlug]);

  return { vendor, products, loading, error };
} 