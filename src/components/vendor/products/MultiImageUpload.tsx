// src/components/vendor/products/MultiImageUpload.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { validateAndOptimizeImage, PRODUCT_IMAGE_CONFIG, formatFileSize, getImageValidationMessage } from '@/utils/imageValidation';
import { getMaxAllowedImages } from '@/lib/featureFlags';

interface MultiImageUploadProps {
  images: File[];
  previewUrls: string[];
  onImagesChange: (files: File[]) => void;
  onPreviewUrlsChange: (urls: string[]) => void;
  maxImages?: number; // Default: 3
  existingImages?: string[]; // For edit mode
  productIndex?: number;
}

export function MultiImageUpload({
  images,
  previewUrls,
  onImagesChange,
  onPreviewUrlsChange,
  maxImages = getMaxAllowedImages(),
  existingImages = [],
  productIndex = 0
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const totalImages = images.length + existingImages.length;
  const canAddMoreImages = totalImages < maxImages;

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      // Limit to remaining slots
      const remainingSlots = maxImages - totalImages;
      const filesToProcess = acceptedFiles.slice(0, remainingSlots);
      
      if (filesToProcess.length === 0) {
        toast.general.uploadError(`You can only upload a maximum of ${maxImages} images`);
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      try {
        const newImages = [...images];
        const newPreviewUrls = [...previewUrls];
        
        // Process each file
        for (const file of filesToProcess) {
          const validationResult = await validateAndOptimizeImage(file, PRODUCT_IMAGE_CONFIG);
          
          if (!validationResult.isValid) {
            setValidationError(validationResult.error || 'Image validation failed');
            toast.general.uploadError();
            continue;
          }

          const optimizedFile = validationResult.optimizedFile || file;
          newImages.push(optimizedFile);

          const newPreviewUrl = URL.createObjectURL(optimizedFile);
          newPreviewUrls.push(newPreviewUrl);
        }
        
        onImagesChange(newImages);
        onPreviewUrlsChange(newPreviewUrls);
      } catch (error) {
        console.error('Image validation error:', error);
        setValidationError('Failed to process image');
        toast.general.uploadError();
      } finally {
        setIsValidating(false);
      }
    },
    [images, previewUrls, onImagesChange, onPreviewUrlsChange, maxImages, totalImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    disabled: !canAddMoreImages || isValidating,
    maxFiles: maxImages - totalImages,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  });

  const removeImage = (index: number) => {
    // Handle preview URL cleanup
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Remove the image and its preview
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    onImagesChange(newImages);
    onPreviewUrlsChange(newPreviewUrls);
    setValidationError(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) {
      return; // Can't move further in this direction
    }
    
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap images
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    [newPreviewUrls[index], newPreviewUrls[targetIndex]] = [newPreviewUrls[targetIndex], newPreviewUrls[index]];
    
    onImagesChange(newImages);
    onPreviewUrlsChange(newPreviewUrls);
  };

  return (
    <div className="space-y-4">
      {canAddMoreImages && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            isDragging && 'border-primary bg-primary/5',
            validationError && 'border-destructive bg-destructive/5',
            isValidating && 'opacity-50 cursor-not-allowed',
            !canAddMoreImages && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} disabled={isValidating || !canAddMoreImages} />
          <div className="flex flex-col items-center gap-2">
            {isValidating ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            ) : (
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {isValidating 
                ? 'Processing images...' 
                : `Drag and drop ${totalImages > 0 ? 'more ' : ''}images${productIndex > 0 ? ` for product ${productIndex + 1}` : ''}, or click to select`
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {`Upload up to ${maxImages - totalImages} more image${maxImages - totalImages !== 1 ? 's' : ''} • `}
              Max size: {formatFileSize(PRODUCT_IMAGE_CONFIG.maxFileSize)} • 
              Max dimensions: {PRODUCT_IMAGE_CONFIG.maxWidth}x{PRODUCT_IMAGE_CONFIG.maxHeight}
            </p>
          </div>
        </div>
      )}

      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{validationError}</p>
        </div>
      )}

      {!totalImages && !validationError && (
        <div>
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              <span className="font-medium">Image required:</span> Products with images get better visibility
            </p>
          </div>
          <p className="text-xs">
            <a 
              href="https://tinypng.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              Click to optimize large images for free before uploading
            </a>
          </p>
        </div>
      )}

      {/* Display uploaded images */}
      {(previewUrls.length > 0 || existingImages.length > 0) && (
        <div className="space-y-2">
          {/* New uploaded images */}
          {previewUrls.map((url, index) => (
            <div key={`new-${index}`} className="relative group border rounded-lg p-1">
              <div className="flex items-center gap-2">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1 text-sm">
                  {index === 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Primary</span>}
                  <p className="text-sm text-muted-foreground truncate">
                    {images[index]?.name || `Image ${index + 1}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(images[index]?.size || 0)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveImage(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  )}
                  {index < previewUrls.length - 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveImage(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Existing images (for edit mode) */}
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative group border rounded-lg p-1">
              <div className="flex items-center gap-2">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1 text-sm">
                  {previewUrls.length === 0 && index === 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Primary</span>
                  )}
                  <p className="text-sm text-muted-foreground truncate">
                    Existing image {index + 1}
                  </p>
                </div>
                {/* We would need additional logic to handle reordering/removing existing images */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
