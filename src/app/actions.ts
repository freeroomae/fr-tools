
"use server";

import { enhancePropertyContent } from '@/ai/flows/enhance-property-description';
import { extractPropertyInfo } from '@/ai/flows/extract-property-info';
import { savePropertiesToDb, saveHistoryEntry, updatePropertyInDb, deletePropertyFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { type Property, type HistoryEntry } from '@/lib/types';
import type { FirebaseApp } from 'firebase/app';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Check if all Firebase config values are present.
const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

if (!isFirebaseConfigured) {
    console.warn("Firebase configuration is incomplete. Image uploads will be skipped. Please check your .env file.");
}


// Function to download an image from a URL, and upload it to Firebase Storage
async function uploadImageAndGetUrl(imageUrl: string, propertyId: string): Promise<string> {
    if (!isFirebaseConfigured) {
      console.log("Firebase not configured, returning original image URL.");
      return imageUrl;
    }

    if (!imageUrl || !imageUrl.startsWith('http')) {
        console.log(`Skipping invalid or non-http URL: ${imageUrl}`);
        return imageUrl; // Return original URL if it's invalid or local
    }
    
    try {
        const { initializeApp, getApp, getApps } = await import('firebase/app');
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { v4: uuidv4 } = await import('uuid');

        // Initialize Firebase lazily
        const getFirebaseApp = (): FirebaseApp => {
            return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        };

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


async function getHtml(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        if (error instanceof Error) {
            throw new Error(`Could not retrieve content from ${url}. Reason: ${error.message}`);
        }
        throw new Error(`Could not retrieve content from ${url}.`);
    }
}

async function processAndSaveHistory(properties: any[], originalUrl: string, historyEntry: Omit<HistoryEntry, 'id' | 'date' | 'propertyCount'>) {
    console.log(`AI extracted ${properties.length} properties. Processing content...`);
    
    const processingPromises = properties.map(async (p, index) => {
        // Step 1: Download images, upload to Firebase Storage, and get public URLs
        const uploadedImageUrls = await Promise.all(
            (p.image_urls && Array.isArray(p.image_urls))
            ? p.image_urls.map((imgUrl: string) => 
                uploadImageAndGetUrl(imgUrl, `prop-${Date.now()}-${index}`).catch(err => {
                    console.error(`Failed to process image ${imgUrl}:`, err);
                    // On failure, fall back to original URL
                    return imgUrl;
                })
            )
            : []
        );

        const finalImageUrls = uploadedImageUrls.filter(Boolean); // Filter out any nulls from failed uploads
        if (finalImageUrls.length === 0) {
            finalImageUrls.push('https://placehold.co/600x400.png');
        }

        console.log(`Processed and uploaded image URLs:`, finalImageUrls);

        // Step 2: Enhance text content
        const enhancedContent = (p.title && p.description) 
            ? await enhancePropertyContent({ title: p.title, description: p.description })
            : { enhancedTitle: p.title, enhancedDescription: p.description };
        
        // Step 3: Assemble final property object
        return {
            ...p,
            id: `prop-${Date.now()}-${index}`,
            original_url: originalUrl,
            original_title: p.title,
            original_description: p.description,
            title: enhancedContent.enhancedTitle,
            description: enhancedContent.enhancedDescription,
            enhanced_title: enhancedContent.enhancedTitle,
            enhanced_description: enhancedContent.enhancedDescription,
            scraped_at: new Date().toISOString(),
            image_urls: finalImageUrls,
            image_url: finalImageUrls[0],
        };
    });

    const finalProperties = await Promise.all(processingPromises);
    
    console.log('Content processing complete.');
    
    await saveHistoryEntry({
        ...historyEntry,
        propertyCount: finalProperties.length,
    });

    revalidatePath('/history');

    return finalProperties;
}


export async function scrapeUrl(url: string): Promise<Property[] | null> {
    console.log(`Scraping URL: ${url}`);

    if (!url || !url.includes('http')) {
        throw new Error('Invalid URL provided.');
    }
    
    const htmlContent = await getHtml(url);
    const result = await extractPropertyInfo({ htmlContent });
    if (!result || !result.properties) {
        console.log("AI extraction returned no properties.");
        return [];
    }
    
    return processAndSaveHistory(result.properties, url, { type: 'URL', details: url });
}

export async function scrapeHtml(html: string, originalUrl: string = 'scraped-from-html'): Promise<Property[] | null> {
    console.log(`Scraping HTML of length: ${html.length}`);

    if (!html || html.length < 100) {
        throw new Error('Invalid HTML provided.');
    }

    const result = await extractPropertyInfo({ htmlContent: html });
    if (!result || !result.properties) {
        console.log("AI extraction returned no properties.");
        return [];
    }
    
    return processAndSaveHistory(result.properties, originalUrl, { type: 'HTML', details: 'Pasted HTML content' });
}

export async function scrapeBulk(urls: string): Promise<Property[] | null> {
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    console.log(`Bulk scraping ${urlList.length} URLs.`);

    if (urlList.length === 0) {
        throw new Error('No valid URLs found in bulk input.');
    }
    
    const allResults: Property[] = [];
    // Process URLs sequentially to be gentle on target servers
    for (const url of urlList) {
        try {
            console.log(`Scraping ${url} in bulk...`);
            const htmlContent = await getHtml(url);
            const result = await extractPropertyInfo({ htmlContent });
            if (result && result.properties) {
                const processed = await processAndSaveHistory(result.properties, url, {type: 'BULK', details: `Bulk operation included: ${url}`});
                allResults.push(...processed);
            }
        } catch (error) {
            console.error(`Failed to scrape ${url} during bulk operation:`, error);
        }
    }
    
    return allResults;
}


// NEW ACTIONS FOR DATABASE MANAGEMENT
export async function saveProperty(property: Property) {
    await savePropertiesToDb([property]); // savePropertiesToDb accepts an array
    revalidatePath('/database');
}

export async function updateProperty(property: Property) {
    await updatePropertyInDb(property);
    revalidatePath('/database');
}

export async function deleteProperty(propertyId: string) {
    await deletePropertyFromDb(propertyId);
    revalidatePath('/database');
}

export async function reEnhanceProperty(property: Property): Promise<Property | null> {
    try {
        const enhancedContent = await enhancePropertyContent({ 
            title: property.original_title, 
            description: property.original_description 
        });

        const updatedProperty = {
            ...property,
            title: enhancedContent.enhancedTitle,
            description: enhancedContent.enhancedDescription,
            enhanced_title: enhancedContent.enhancedTitle,
            enhanced_description: enhancedContent.enhancedDescription,
        };
        
        await updatePropertyInDb(updatedProperty);
        revalidatePath('/database');
        
        return updatedProperty;
    } catch(error) {
        console.error("Failed to re-enhance property:", error);
        return null;
    }
}
