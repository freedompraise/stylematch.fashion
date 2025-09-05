// src/lib/cloudinary.ts
import crypto from 'crypto';

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

export async function uploadStoreBanner(file: File): Promise<string> {
  return uploadToCloudinary(file, {
    folder: 'store-banners'
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(publicId, timestamp);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('signature', signature);
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY || '');
    formData.append('timestamp', timestamp.toString());

    fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          reject(data.error);
        }else {
          resolve();
        }
      })
      .catch((error) => {
        console.error("Error during Cloudinary delete:", error);
        reject(error);
      });
  });
}

export const getPublicIdFromUrl = (url: string) => {
  if (!url) {
    console.error("Image URL is missing!");
    return "";
  }
  const publicId = url.match(/(?:\/v\d+\/)?([^/.]+)(?:\.[a-z]+)?$/)?.[1] || "";
  return publicId;
};

function generateSignature(publicId: string, timestamp: number): string {
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${import.meta.env.VITE_CLOUDINARY_API_SECRET}`;
  const hash = crypto.createHash('sha1').update(paramsToSign).digest('hex');
  return hash;
}

