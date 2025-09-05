import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { validateAndOptimizeImage, STORE_BANNER_CONFIG, formatFileSize, getImageValidationMessage } from '@/utils/imageValidation';

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
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (existingImageUrl && !imageFile) {
      onPreviewUrlChange(existingImageUrl);
    }
  }, [existingImageUrl, imageFile, onPreviewUrlChange]);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsValidating(true);
      setValidationError(null);

      try {
        // Validate and optimize the image
        const validationResult = await validateAndOptimizeImage(file, STORE_BANNER_CONFIG);
        
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
        onImageFileChange(optimizedFile);

        // Clean up previous blob URL if it exists
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }

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
    setValidationError(null);
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
              : 'Drag and drop an image, or click to select'
            }
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {formatFileSize(STORE_BANNER_CONFIG.maxFileSize)} • 
            Max dimensions: {STORE_BANNER_CONFIG.maxWidth}x{STORE_BANNER_CONFIG.maxHeight}
          </p>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{validationError}</p>
        </div>
      )}

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