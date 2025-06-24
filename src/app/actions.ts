"use server";

import { enhancePropertyContent } from '@/ai/flows/enhance-property-description';
import { extractPropertyInfo } from '@/ai/flows/extract-property-info';
import fs from 'fs/promises';
import path from 'path';
import { savePropertiesToDb, saveHistoryEntry, updatePropertyInDb, deletePropertyFromDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { type Property, type HistoryEntry } from '@/lib/types';


async function downloadImage(imageUrl: string): Promise<string | null> {
    // Don't download placeholders or invalid URLs
    if (!imageUrl || !imageUrl.startsWith('http') || imageUrl.includes('placehold.co')) {
        return null;
    }

    try {
        const response = await fetch(imageUrl, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            console.error(`Failed to fetch image: ${response.status} ${response.statusText} from URL: ${imageUrl}`);
            return null;
        }

        const imageBuffer = Buffer.from(await response.arrayBuffer());
        
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const originalFilename = path.basename(new URL(imageUrl).pathname);
        const fileExtension = path.extname(originalFilename) || '.jpg';
        const filename = `${uniqueSuffix}${fileExtension}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
        
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, filename);

        await fs.writeFile(filePath, imageBuffer);

        const publicUrl = `/uploads/properties/${filename}`;
        console.log(`Image downloaded: ${imageUrl} -> ${publicUrl}`);
        return publicUrl;
        
    } catch (error) {
        console.error(`Error downloading image from ${imageUrl}:`, error);
        return null;
    }
}


async function getHtml(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                // Some websites block requests without a user agent.
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
    console.log(`AI extracted ${properties.length} properties. Processing content and images...`);
    
    const processingPromises = properties.map(async (p, index) => {
        const downloadedImageUrls = await Promise.all(
            (p.image_urls || []).map((url: string) => downloadImage(url))
        );
        const localImageUrls = downloadedImageUrls.filter((url): url is string => !!url);

        const enhancedContent = (p.title && p.description) 
            ? await enhancePropertyContent({ title: p.title, description: p.description })
            : { enhancedTitle: p.title, enhancedDescription: p.description };
        
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
            image_urls: localImageUrls.length > 0 ? localImageUrls : ['https://placehold.co/600x400.png'],
            image_url: localImageUrls.length > 0 ? localImageUrls[0] : 'https://placehold.co/600x400.png',
        };
    });

    const finalProperties = await Promise.all(processingPromises);
    
    console.log('Content processing and image downloading complete.');
    
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
