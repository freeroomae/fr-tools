"use server";

import { enhancePropertyDescription } from '@/ai/flows/enhance-property-description';
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

const mockProperties: Property[] = [
    {
        id: 'prop1',
        original_url: 'https://placehold.co/1',
        title: 'Luxurious Downtown Penthouse with Stunning Views',
        original_title: 'Downtown Penthouse',
        description: 'Experience unparalleled luxury in this stunning 3-bedroom, 4-bathroom penthouse. Featuring floor-to-ceiling windows, a gourmet kitchen, and a private rooftop terrace. Located in the heart of the city, you are steps away from fine dining and entertainment.',
        original_description: '3 bed 4 bath penthouse downtown. Has windows and a kitchen.',
        price: '$4,500,000',
        location: '123 Main Street, Metropolis, USA',
        bedrooms: 3,
        bathrooms: 4,
        area: '3,200 sqft',
        property_type: 'Penthouse',
        image_url: 'https://placehold.co/600x400.png',
        scraped_at: new Date().toISOString(),
    },
    {
        id: 'prop2',
        original_url: 'https://placehold.co/2',
        title: 'Charming Suburban Family Home with Large Backyard',
        original_title: 'Family Home',
        description: 'This beautiful 4-bedroom family home offers a spacious layout and a large, private backyard perfect for kids and pets. Recently renovated kitchen with modern appliances. Situated in a quiet, family-friendly neighborhood with top-rated schools.',
        original_description: '4 bedroom house with a big yard. Good for families. New kitchen.',
        price: '$850,000',
        location: '456 Oak Avenue, Suburbia, USA',
        bedrooms: 4,
        bathrooms: 2,
        area: '2,500 sqft',
        property_type: 'House',
        image_url: 'https://placehold.co/600x400.png',
        scraped_at: new Date().toISOString(),
    },
    {
        id: 'prop3',
        original_url: 'https://placehold.co/3',
        title: 'Modern & Cozy Studio Apartment in Vibrant Area',
        original_title: 'Studio Apt',
        description: 'A stylish and modern studio apartment, perfect for young professionals. This unit boasts smart home features, a compact but fully-equipped kitchen, and access to building amenities like a gym and pool. Located in a vibrant area with great nightlife.',
        original_description: 'Studio apartment for one person. Has a gym.',
        price: '$2,800/month',
        location: '789 Tech Way, Innovate City, USA',
        bedrooms: 0,
        bathrooms: 1,
        area: '550 sqft',
        property_type: 'Apartment',
        image_url: 'https://placehold.co/600x400.png',
        scraped_at: new Date().toISOString(),
    }
];


// Simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function scrapeUrl(url: string): Promise<Property[] | null> {
    console.log(`Scraping URL: ${url}`);
    await sleep(1500);

    if (!url || !url.includes('http')) {
        throw new Error('Invalid URL provided.');
    }
    
    // In a real app, you'd use Puppeteer/Cheerio here.
    // We'll return a random mock property.
    const property = { ...mockProperties[Math.floor(Math.random() * mockProperties.length)] };
    property.id = `prop-${Date.now()}`;
    property.original_url = url;
    return [property];
}

export async function scrapeHtml(html: string): Promise<Property[] | null> {
    console.log(`Scraping HTML of length: ${html.length}`);
    await sleep(1500);

    if (!html || html.length < 100) {
        throw new Error('Invalid HTML provided.');
    }

    const property = { ...mockProperties[Math.floor(Math.random() * mockProperties.length)] };
    property.id = `prop-${Date.now()}`;
    property.original_url = 'scraped-from-html';
    return [property];
}

export async function scrapeBulk(urls: string): Promise<Property[] | null> {
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    console.log(`Bulk scraping ${urlList.length} URLs.`);
    await sleep(2500);

    if (urlList.length === 0) {
        throw new Error('No valid URLs found in bulk input.');
    }
    
    const results = urlList.map((url, index) => {
        const property = { ...mockProperties[index % mockProperties.length] };
        return {
            ...property,
            id: `prop-${Date.now()}-${index}`,
            original_url: url,
        };
    });

    return results;
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
