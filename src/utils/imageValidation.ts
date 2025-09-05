// src/utils/imageValidation.ts

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  optimizedFile?: File;
}

export interface ImageValidationConfig {
  maxFileSize: number; // in bytes
  maxWidth: number;
  maxHeight: number;
  allowedTypes: string[];
  quality: number; // 0-100
}

// Cloudinary Free Plan Limits - Conservative
export const CLOUDINARY_FREE_LIMITS = {
  // Free plan: 25GB storage, 25GB bandwidth/month
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB per image (conservative for free plan)
  MAX_WIDTH: 1600, // Reasonable for web display
  MAX_HEIGHT: 1600,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  QUALITY: 75, // Good balance between quality and file size
} as const;

export const PRODUCT_IMAGE_CONFIG: ImageValidationConfig = {
  maxFileSize: 3 * 1024 * 1024, // 3MB for product images
  maxWidth: 1000, // Optimized for product display
  maxHeight: 1000,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  quality: 80, // Good quality for products
};

export const STORE_BANNER_CONFIG: ImageValidationConfig = {
  maxFileSize: 4 * 1024 * 1024, // 4MB for store banners
  maxWidth: 1600, // Banner dimensions
  maxHeight: 900,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  quality: 75, // Good quality for banners
};

/**
 * Validates and optimizes an image file for Cloudinary upload
 */
export async function validateAndOptimizeImage(
  file: File,
  config: ImageValidationConfig = PRODUCT_IMAGE_CONFIG
): Promise<ImageValidationResult> {
  const result: ImageValidationResult = {
    isValid: false,
    warnings: [],
  };

  try {
    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      result.error = `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`;
      return result;
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(1);
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      result.error = `File too large. Maximum size: ${maxSizeMB}MB, current size: ${currentSizeMB}MB`;
      return result;
    }

    // Check image dimensions and optimize if needed
    const imageData = await getImageData(file);
    
    if (imageData.width > config.maxWidth || imageData.height > config.maxHeight) {
      result.warnings?.push(
        `Image will be resized from ${imageData.width}x${imageData.height} to fit within ${config.maxWidth}x${config.maxHeight}`
      );
    }

    // Optimize the image
    const optimizedFile = await optimizeImage(file, config);
    
    result.isValid = true;
    result.optimizedFile = optimizedFile;
    
    return result;
  } catch (error) {
    result.error = `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`;
    return result;
  }
}

/**
 * Gets image dimensions and basic metadata
 */
async function getImageData(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Optimizes image file size and dimensions
 */
async function optimizeImage(file: File, config: ImageValidationConfig): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        URL.revokeObjectURL(url);
        
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = calculateOptimalDimensions(
          img.naturalWidth,
          img.naturalHeight,
          config.maxWidth,
          config.maxHeight
        );
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with specified quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'));
              return;
            }
            
            // Create new file with optimized data
            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(optimizedFile);
          },
          file.type,
          config.quality / 100
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for optimization'));
    };
    
    img.src = url;
  });
}

/**
 * Calculates optimal dimensions maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if too wide
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  // Scale down if too tall
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gets user-friendly error message for image validation
 */
export function getImageValidationMessage(result: ImageValidationResult): string {
  if (result.isValid) {
    return 'Image is valid and optimized for upload.';
  }
  
  if (result.error) {
    return result.error;
  }
  
  return 'Image validation failed.';
}

/**
 * Validates multiple images for batch upload
 */
export async function validateMultipleImages(
  files: File[],
  config: ImageValidationConfig = PRODUCT_IMAGE_CONFIG
): Promise<{
  validFiles: File[];
  errors: { file: File; error: string }[];
  warnings: { file: File; warnings: string[] }[];
}> {
  const validFiles: File[] = [];
  const errors: { file: File; error: string }[] = [];
  const warnings: { file: File; warnings: string[] }[] = [];
  
  for (const file of files) {
    const result = await validateAndOptimizeImage(file, config);
    
    if (result.isValid && result.optimizedFile) {
      validFiles.push(result.optimizedFile);
      
      if (result.warnings && result.warnings.length > 0) {
        warnings.push({ file, warnings: result.warnings });
      }
    } else {
      errors.push({ file, error: result.error || 'Validation failed' });
    }
  }
  
  return { validFiles, errors, warnings };
}
