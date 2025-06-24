import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase lazily
const getFirebaseApp = (): FirebaseApp => {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};

// Function to download an image from a URL, and upload it to Firebase Storage
export async function uploadImageAndGetUrl(imageUrl: string, propertyId: string): Promise<string> {
    if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log(`Skipping invalid or non-http URL: ${imageUrl}`);
        return imageUrl; // Return original URL if it's invalid or local
    }
    
    try {
        const app = getFirebaseApp();
        const storage = getStorage(app);

        console.log(`Downloading image from: ${imageUrl}`);
        const response = await fetch(imageUrl, {
            headers: {
                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const imageBuffer = await response.arrayBuffer();
        
        const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const contentType = `image/${fileExtension}`;
        const fileName = `${propertyId}-${uuidv4()}.${fileExtension}`;
        const storageRef = ref(storage, `property-images/${fileName}`);
        
        console.log(`Uploading image to Firebase Storage as: ${fileName}`);
        await uploadBytes(storageRef, imageBuffer, { contentType });
        
        const downloadUrl = await getDownloadURL(storageRef);
        console.log(`Successfully uploaded. Public URL: ${downloadUrl}`);
        
        return downloadUrl;
    } catch (error) {
        console.error(`Error processing image from ${imageUrl}:`, error);
        // Fallback to the original URL if upload fails
        return imageUrl;
    }
}
