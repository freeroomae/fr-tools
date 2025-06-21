"use server";

import { enhancePropertyDescription } from '@/ai/flows/enhance-property-description';
import { extractPropertyInfo } from '@/ai/flows/extract-property-info';
import { z } from 'zod';

export type Property = {
    id: string;
    original_url: string;
    title: string;
    original_title: string;
    description: string;
    original_description: string;
    enhanced_description?: string;
    price: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    property_type: string;
    image_url: string;
    scraped_at: string;
};

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

export async function scrapeUrl(url: string): Promise<Property[] | null> {
    console.log(`Scraping URL: ${url}`);

    if (!url || !url.includes('http')) {
        throw new Error('Invalid URL provided.');
    }
    
    const htmlContent = await getHtml(url);
    return scrapeHtml(htmlContent, url);
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
    
    console.log(`AI extracted ${result.properties.length} properties.`);

    const properties: Property[] = result.properties.map((p, index) => ({
        ...p,
        id: `prop-${Date.now()}-${index}`,
        original_url: originalUrl,
        original_title: p.title,
        original_description: p.description,
        scraped_at: new Date().toISOString(),
    }));
    
    return properties;
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
            const properties = await scrapeUrl(url);
            if (properties) {
                allResults.push(...properties);
            }
        } catch (error) {
            console.error(`Failed to scrape ${url} during bulk operation:`, error);
            // In a real app, you might want to surface this failure to the user.
            // For now, we just log it and continue.
        }
    }

    return allResults;
}

const EnhanceDescriptionInput = z.object({
  description: z.string(),
});

export async function enhanceDescription(description: string) {
    const validatedInput = EnhanceDescriptionInput.safeParse({ description });
    if (!validatedInput.success) {
        throw new Error('Invalid input for enhancement.');
    }

    // Call the Genkit flow
    const result = await enhancePropertyDescription(validatedInput.data);
    return result;
}
