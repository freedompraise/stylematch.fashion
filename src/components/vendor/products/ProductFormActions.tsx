import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProductFormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductFormActions({ onCancel, isSubmitting = false }: ProductFormActionsProps) {
  const { formState: { isValid } } = useFormContext();

  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Product'
        )}
      </Button>
    </div>
  );
} 