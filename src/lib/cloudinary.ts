// cloudinary.ts

export async function uploadToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'stylematch');

    fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
      .then((response) => response.json())
      .then((data) => resolve(data.secure_url))
      .catch((error) => reject(error));
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
      .then(() => resolve())
      .catch((error) => reject(error));
  });
}

export function getPublicIdFromUrl(url: string): string {
  const matches = url.match(/\/v\d+\/([^/]+)\.\w+$/);
  return matches ? matches[1] : '';
}

function generateSignature(publicId: string, timestamp: number): string {
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${import.meta.env.VITE_CLOUDINARY_API_SECRET || ''}`;
  let hash = 0;
  for (let i = 0; i < paramsToSign.length; i++) {
    const char = paramsToSign.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}
