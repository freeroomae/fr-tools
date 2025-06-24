'use server';

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// Helper to fetch image as a blob
async function fetchImageAsBlob(imageUrl: string): Promise<Blob | null> {
    try {
        // Use a proxy or a more robust fetching mechanism if direct fetch fails due to CORS or other restrictions
        const response = await fetch(imageUrl, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
            },
            cache: 'no-store' // Attempt to bypass caches that might serve stale or incorrect data
        });
        if (!response.ok) {
            console.error(`Failed to fetch image ${imageUrl}: ${response.status} ${response.statusText}`);
            return null;
        }
        return await response.blob();
    } catch (error) {
        console.error(`Error fetching image blob for ${imageUrl}:`, error);
        return null;
    }
}

/**
 * Uploads an image from a URL to Firebase Storage and returns the public URL.
 * If the upload fails, it returns the original URL as a fallback.
 * @param imageUrl The original URL of the image to upload.
 * @returns The new public Firebase Storage URL, or the original URL on failure.
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
    // Return original URL for local image paths or if it's invalid.
    if (!imageUrl || !imageUrl.startsWith('http')) {
        // It might be a local path like /uploads/... which is valid in some contexts
        return imageUrl; 
    }

    try {
        const blob = await fetchImageAsBlob(imageUrl);
        if (!blob) {
            console.warn(`Could not fetch blob for ${imageUrl}, returning original URL.`);
            return imageUrl; // Fallback to original URL if blob fetch fails
        }
        
        // Infer file extension from blob type, default to jpg
        const fileExtension = blob.type.split('/')[1] || 'jpg';
        const fileName = `properties/${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        
        return downloadUrl;
    } catch (error) {
        console.error(`Error uploading image from ${imageUrl} to Firebase Storage:`, error);
        return imageUrl; // Fallback to original URL on any upload failure
    }
}
