import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  submittingText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export function FormActions({ 
  onCancel, 
  isSubmitting = false,
  submitText = 'Save',
  submittingText = 'Saving...',
  cancelText = 'Cancel',
  disabled = false
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {submittingText}
          </>
        ) : (
          submitText
        )}
      </Button>
    </div>
  );
}
