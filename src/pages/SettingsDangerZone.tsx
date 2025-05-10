import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useVendorData } from '@/services/vendorDataService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const SettingsDangerZone: React.FC = () => {
  const { session } = useSession();
  const { deleteProduct, fetchProducts } = useVendorData();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Placeholder for account deletion logic
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // TODO: Implement account deletion (Supabase + Cloudinary cleanup)
      toast({ title: 'Account deleted', description: 'Your account has been deleted.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete account.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  // Placeholder for storefront reset logic
  const handleResetStorefront = async () => {
    setLoading(true);
    try {
      if (!session?.user?.id) throw new Error('No user');
      // Delete all products for this vendor
      const products = await fetchProducts(session.user.id, true);
      await Promise.all(products.map(p => deleteProduct(p.id)));
      toast({ title: 'Storefront reset', description: 'All products have been deleted.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reset storefront.', variant: 'destructive' });
    } finally {
      setLoading(false);
      setResetOpen(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-destructive">Danger Zone</h1>
      <div className="space-y-8">
        <div className="border border-destructive rounded-md p-6 bg-destructive/5">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Delete Account</h2>
          <p className="mb-4 text-muted-foreground">This will permanently delete your vendor account and all associated data. This action cannot be undone.</p>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={loading}>
            Delete Account
          </Button>
        </div>
        <div className="border border-destructive rounded-md p-6 bg-destructive/5">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Reset Storefront</h2>
          <p className="mb-4 text-muted-foreground">This will delete all your products. Your account and profile will remain.</p>
          <Button variant="outline" className="border-destructive text-destructive" onClick={() => setResetOpen(true)} disabled={loading}>
            Reset Storefront
          </Button>
        </div>
      </div>
      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reset Storefront Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Storefront Reset</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete all your products? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetStorefront} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Storefront'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsDangerZone; 