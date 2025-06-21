import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImagePlus, X } from 'lucide-react';

interface StoreImageUploadProps {
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  previewUrl: string | null;
  onPreviewUrlChange: (url: string | null) => void;
  existingImageUrl?: string | null;
}

export function StoreImageUpload({
  imageFile,
  onImageFileChange,
  previewUrl,
  onPreviewUrlChange,
  existingImageUrl,
}: StoreImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (existingImageUrl && !imageFile) {
      onPreviewUrlChange(existingImageUrl);
    }
  }, [existingImageUrl, imageFile, onPreviewUrlChange]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      onImageFileChange(file);

      // Clean up previous blob URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      const newPreviewUrl = URL.createObjectURL(file);
      onPreviewUrlChange(newPreviewUrl);
    },
    [onImageFileChange, onPreviewUrlChange, previewUrl]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    onImageFileChange(null);
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
            Drag and drop an image, or click to select
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Store Banner Preview"
            className="w-full h-auto max-h-48 object-cover rounded-lg"
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