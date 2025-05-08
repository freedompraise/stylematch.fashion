import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';

interface ProductImageUploadProps {
  image: File | null;
  previewUrl: string | null;
  onImageChange: (file: File | null) => void;
  onPreviewUrlChange: (url: string | null) => void;
  productIndex: number;
}

export function ProductImageUpload({
  image,
  previewUrl,
  onImageChange,
  onPreviewUrlChange,
  productIndex
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      onImageChange(file);

      // Generate preview URL for the file
      const newPreviewUrl = URL.createObjectURL(file);
      onPreviewUrlChange(newPreviewUrl);
    },
    [onImageChange, onPreviewUrlChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  });

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onImageChange(null);
    onPreviewUrlChange(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isDragging && 'border-primary bg-primary/5'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop image for product {productIndex + 1}, or click to select
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="relative group">
          <img
            src={previewUrl}
            alt={`Preview for product ${productIndex + 1}`}
            className="w-full h-32 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 