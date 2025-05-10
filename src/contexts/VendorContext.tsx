// VendorContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from './SessionContext';
import { VendorProfile } from '@/types/VendorSchema';
import { useVendorData } from '@/services/vendorDataService';

interface VendorContextType {
  vendor: VendorProfile | null;
  loading: boolean;
  refreshVendor: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const { getVendorProfile } = useVendorData();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadVendor = async () => {
    if (!session.user) {
      setVendor(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await getVendorProfile(session.user.id);
    setVendor(data || null);
    setLoading(false);
  };

  useEffect(() => {
    loadVendor();
  }, [session.user]);

  return (
    <VendorContext.Provider value={{ vendor, loading, refreshVendor: loadVendor }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}
