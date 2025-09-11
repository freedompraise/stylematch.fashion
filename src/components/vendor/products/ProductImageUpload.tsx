import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { validateAndOptimizeImage, PRODUCT_IMAGE_CONFIG, formatFileSize, getImageValidationMessage } from '@/utils/imageValidation';

interface ProductImageUploadProps {
  image: File | null;
  previewUrl: string | null;
  onImageChange: (file: File | null) => void;
  onPreviewUrlChange: (url: string | null) => void;
  onImageRemoved?: () => void;
  productIndex: number;
}

export function ProductImageUpload({
  image,
  previewUrl,
  onImageChange,
  onPreviewUrlChange,
  onImageRemoved,
  productIndex
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsValidating(true);
      setValidationError(null);

      try {
        // Validate and optimize the image
        const validationResult = await validateAndOptimizeImage(file, PRODUCT_IMAGE_CONFIG);
        
        if (!validationResult.isValid) {
          setValidationError(validationResult.error || 'Image validation failed');
          toast({
            title: "Invalid Image",
            description: getImageValidationMessage(validationResult),
            variant: "destructive"
          });
          return;
        }

        // Use optimized file if available, otherwise use original
        const optimizedFile = validationResult.optimizedFile || file;
        onImageChange(optimizedFile);

        // Generate preview URL for the optimized file
        const newPreviewUrl = URL.createObjectURL(optimizedFile);
        onPreviewUrlChange(newPreviewUrl);

        // Show warnings if any
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          toast({
            title: "Image Optimized",
            description: validationResult.warnings.join(', '),
            variant: "default"
          });
        }

        // Show success message if file was optimized
        if (validationResult.optimizedFile && validationResult.optimizedFile.size !== file.size) {
          const originalSize = formatFileSize(file.size);
          const optimizedSize = formatFileSize(validationResult.optimizedFile.size);
          toast({
            title: "Image Optimized",
            description: `File size reduced from ${originalSize} to ${optimizedSize}`,
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Image validation error:', error);
        setValidationError('Failed to process image');
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsValidating(false);
      }
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
    setValidationError(null);
    onImageRemoved?.(); // Notify parent component that image was removed
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isDragging && 'border-primary bg-primary/5',
          validationError && 'border-destructive bg-destructive/5',
          isValidating && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} disabled={isValidating} />
        <div className="flex flex-col items-center gap-2">
          {isValidating ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          ) : (
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isValidating 
              ? 'Processing image...' 
              : `Drag and drop image for product ${productIndex + 1}, or click to select`
            }
          </p>
          <p className="text-xs text-muted-foreground">
          
            Max size: {formatFileSize(PRODUCT_IMAGE_CONFIG.maxFileSize)} • 
            Max dimensions: {PRODUCT_IMAGE_CONFIG.maxWidth}x{PRODUCT_IMAGE_CONFIG.maxHeight}
          </p>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{validationError}</p>
        </div>
      )}

      {!previewUrl && !validationError && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-sm text-amber-800">
            <span className="font-medium">Image required:</span> Products with images get 5x more views and sales
          </p>
        </div>
      )}

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