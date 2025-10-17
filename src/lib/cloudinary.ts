// src/lib/cloudinary.ts

export interface CloudinaryUploadOptions {
  folder?: string;
  quality?: string;
  format?: string;
  transformation?: string;
}

export async function uploadToCloudinary(
  file: File, 
  options: CloudinaryUploadOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', "stylematch");
    
    // Add folder organization
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`HTTP ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (!data.secure_url) {
          console.error('Cloudinary response:', data);
          reject('Image upload failed: no URL returned');
        }
        resolve(data.secure_url)
      })
      .catch((error) => {
        console.error("Error during Cloudinary upload:", error);
        reject(error);
      });
  });
}

// Optimized upload functions for different use cases - Conservative
export async function uploadProductImage(file: File): Promise<string> {
  return uploadToCloudinary(file, {
    folder: 'products'
  });
}

// Multi-image upload function
export async function uploadMultipleProductImages(files: File[]): Promise<string[]> {
  try {
    // Upload all files in parallel
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, {
        folder: 'products'
      })
    );
    
    // Wait for all uploads to complete
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("[Cloudinary] Error during multiple image upload:", error);
    throw error;
  }
}

export async function uploadStoreBanner(file: File): Promise<string> {
  return uploadToCloudinary(file, {
    folder: 'store-banners'
  });
}

export async function uploadPaymentProof(file: File, orderId: string): Promise<string> {
  return uploadToCloudinary(file, {
    folder: `payment-proofs/${orderId}`
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  console.log("[Cloudinary] Starting deletion for public ID:", publicId);
  
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);
    
    console.log("[Cloudinary] Generated signature for deletion");
    console.log("[Cloudinary] Cloud name:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log("[Cloudinary] API key present:", !!import.meta.env.VITE_CLOUDINARY_API_KEY);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY || '');
    formData.append('timestamp', timestamp.toString());

    const deleteUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`;
    console.log("[Cloudinary] Sending delete request to:", deleteUrl);

    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData,
    });

    console.log("[Cloudinary] Delete response status:", response.status);
    console.log("[Cloudinary] Delete response ok:", response.ok);

    const data = await response.json();
    console.log("[Cloudinary] Delete response data:", data);
    
    if (data.error) {
      console.error("[Cloudinary] Delete error from API:", data.error);
      throw new Error(data.error.message || 'Cloudinary deletion failed');
    }
    
    if (data.result === 'ok') {
      console.log("[Cloudinary] Successfully deleted image:", publicId);
    } else {
      console.warn("[Cloudinary] Unexpected result from delete API:", data.result);
    }
    
  } catch (error) {
    console.error("[Cloudinary] Error during deletion for public ID:", publicId, error);
    throw error;
  }
}

// Delete multiple images from Cloudinary
export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return;
  
  console.log("[Cloudinary] Starting batch deletion for", publicIds.length, "images");
  
  try {
    // Delete images in sequence to avoid rate limiting
    for (const publicId of publicIds) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error(`[Cloudinary] Error deleting image ${publicId}:`, error);
        // Continue with other deletions even if one fails
      }
    }
    
    console.log("[Cloudinary] Batch deletion complete");
  } catch (error) {
    console.error("[Cloudinary] Error during batch deletion:", error);
    throw error;
  }
}

export const getPublicIdFromUrl = (url: string) => {
  if (!url) {
    console.error("[Cloudinary] Image URL is missing!");
    return "";
  }
  
  console.log("[Cloudinary] Extracting public ID from URL:", url);
  
  // Handle different Cloudinary URL formats
  // Format 1: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
  // Format 2: https://res.cloudinary.com/cloud_name/image/upload/folder/filename.jpg
  // Format 3: Just the public ID itself
  
  let publicId = "";
  
  // If it's already just a public ID (no http/https), return as is
  if (!url.startsWith('http')) {
    publicId = url;
    console.log("[Cloudinary] URL appears to be a public ID already:", publicId);
  } else {
    // Extract from full Cloudinary URL
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    // We want to extract: folder/filename (without extension)
    const match = url.match(/\/upload(?:\/v\d+)?\/(.+?)(?:\.[a-z]+)?$/);
    if (match) {
      publicId = match[1];
      console.log("[Cloudinary] Extracted public ID from full URL:", publicId);
    } else {
      console.error("[Cloudinary] Could not extract public ID from URL:", url);
    }
  }
  
  return publicId;
};

async function generateSignature(publicId: string, timestamp: number): Promise<string> {
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${import.meta.env.VITE_CLOUDINARY_API_SECRET}`;
  
  // Use Web Crypto API instead of Node.js crypto module
  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

