import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateStoreNameForSlug(storeName: string): { isValid: boolean; error?: string } {
  if (!storeName || storeName.trim().length === 0) {
    return { isValid: false, error: 'Store name cannot be empty' };
  }
  
  if (storeName.trim().length < 2) {
    return { isValid: false, error: 'Store name must be at least 2 characters long' };
  }
  
  if (storeName.trim().length > 50) {
    return { isValid: false, error: 'Store name cannot exceed 50 characters' };
  }
  
  const validSlugPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validSlugPattern.test(storeName)) {
    return { isValid: false, error: 'Store name contains invalid characters. Use only letters, numbers, spaces, hyphens, and underscores.' };
  }
  
  return { isValid: true };
}

export function generateSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(
  storeName: string, 
  checkSlugExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const validation = validateStoreNameForSlug(storeName);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  let baseSlug = generateSlug(storeName);
  let slug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    if (counter > 100) {
      throw new Error('Unable to generate unique slug after 100 attempts');
    }
  }

  return slug;
}
