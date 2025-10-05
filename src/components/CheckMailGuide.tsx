// src/components/CheckMailGuide.tsx
import React, { useState } from 'react';
import { Mail, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CheckMailGuideProps {
  show: boolean;
  onDismiss?: () => void;
  compact?: boolean;
  gmailUrl?: string;
}

const CheckMailGuide: React.FC<CheckMailGuideProps> = ({ show, onDismiss, compact, gmailUrl = 'https://mail.google.com/mail/u/0/#spam' }) => {
  const [open, setOpen] = useState(false);
  if (!show) return null;

  return (
    <>
      <div className={compact ? 'p-3 rounded-lg border border-border bg-muted/40' : 'p-4 rounded-lg border border-border bg-muted/40'}>
        <div className="flex items-start gap-3">
          {onDismiss && (
            <button
              type="button"
              className="ml-auto order-2 text-muted-foreground hover:text-foreground"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          )}
          <div className="flex-1 space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn’t see our email yet? Sometimes it lands in Spam or Promotions. You can open Gmail directly to check.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
   
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
                Why this message?
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-lg">Check your spam folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Email providers sometimes sort new sender emails into Spam or Promotions. If you don’t see our email, please check those folders.
            </p>
            <a href={gmailUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full flex items-center justify-center gap-2">
                Go to Gmail
                <ExternalLink size={16} />
              </Button>
            </a>
            <p className="text-xs text-muted-foreground">
              This link opens Gmail in a new tab. We never ask for your password or personal details.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckMailGuide;


