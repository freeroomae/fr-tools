"use server";

import { enhancePropertyContent } from '@/ai/flows/enhance-property-description';
import { extractPropertyInfo } from '@/ai/flows/extract-property-info';
import { z } from 'zod';

export type Property = {
    id: string;
    original_url: string;
    title: string;
    original_title: string;
    description: string;
    original_description: string;
    enhanced_title?: string;
    enhanced_description?: string;
    price: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    property_type: string;
    image_url: string;
    image_urls: string[];
    scraped_at: string;
    mortgage: string;
    neighborhood: string;
    what_do: string;
    city: string;
    county: string;
    tenant_type: string;
    rental_timing: string;
    furnish_type: string;
    floor_number: number;
    features: string[];
    terms_and_condition: string;
    page_link: string;

    validated_information: string;
    building_information: string;
    permit_number: string;
    ded_license_number: string;
    rera_registration_number: string;
    reference_id: string;
    dld_brn: string;
    listed_by_name: string;
    listed_by_phone: string;
    listed_by_email: string;
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
    
    console.log(`AI extracted ${result.properties.length} properties. Enhancing content...`);
    
    const enhancementPromises = result.properties.map(p => {
        if (p.title && p.description) {
            return enhancePropertyContent({ title: p.title, description: p.description });
        }
        return Promise.resolve(null);
    });
    
    const enhancedContents = await Promise.all(enhancementPromises);

    const properties: Property[] = result.properties.map((p, index) => {
        const enhancedContent = enhancedContents[index];
        return {
            ...p,
            id: `prop-${Date.now()}-${index}`,
            original_url: originalUrl,
            original_title: p.title,
            original_description: p.description,
            title: enhancedContent ? enhancedContent.enhancedTitle : p.title,
            description: enhancedContent ? enhancedContent.enhancedDescription : p.description,
            enhanced_title: enhancedContent?.enhancedTitle,
            enhanced_description: enhancedContent?.enhancedDescription,
            scraped_at: new Date().toISOString(),
            image_url: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : 'https://placehold.co/600x400.png',
        }
    });
    
    console.log('Content enhancement complete.');
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

const EnhanceContentInput = z.object({
  title: z.string(),
  description: z.string(),
});

export async function enhanceContent(input: { title: string, description: string }) {
    const validatedInput = EnhanceContentInput.safeParse(input);
    if (!validatedInput.success) {
        throw new Error('Invalid input for enhancement.');
    }

    // Call the Genkit flow
    const result = await enhancePropertyContent(validatedInput.data);
    return result;
}
