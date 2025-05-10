import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  submittingText?: string;
  cancelText?: string;
}

export function FormActions({ 
  onCancel, 
  isSubmitting = false,
  submitText = 'Save',
  submittingText = 'Saving...',
  cancelText = 'Cancel'
}: FormActionsProps) {
  const { formState: { isValid } } = useFormContext();

  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelText}
      </Button>
      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
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
