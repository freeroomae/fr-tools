'use server';
/**
 * @fileOverview A Genkit flow to extract property information from HTML.
 *
 * - extractPropertyInfo - Extracts structured property data from HTML content.
 * - ExtractPropertyInfoInput - The input type for the extractPropertyInfo function.
 * - ExtractPropertyInfoOutput - The return type for the extractPropertyInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractedPropertySchema = z.object({
  title: z.string().describe('The main title of the property listing.'),
  description: z.string().describe('A detailed description of the property.'),
  price: z.string().describe('The listing price of the property.'),
  location: z.string().describe('The address or general location of the property.'),
  bedrooms: z.number().describe('The number of bedrooms.'),
  bathrooms: z.number().describe('The number of bathrooms.'),
  area: z.string().describe('The total area of the property (e.g., "2,500 sqft").'),
  property_type: z.string().describe('The type of property (e.g., House, Apartment).'),
  image_url: z.string().describe('A URL to a primary image of the property.'),
});

const ExtractPropertyInfoInputSchema = z.object({
  htmlContent: z.string().describe('The full HTML content of a property listing page.'),
});
export type ExtractPropertyInfoInput = z.infer<typeof ExtractPropertyInfoInputSchema>;

const ExtractPropertyInfoOutputSchema = z.object({
  properties: z.array(ExtractedPropertySchema).describe('An array of properties found on the page.'),
});
export type ExtractPropertyInfoOutput = z.infer<typeof ExtractPropertyInfoOutputSchema>;


export async function extractPropertyInfo(
  input: ExtractPropertyInfoInput
): Promise<ExtractPropertyInfoOutput> {
  return extractPropertyInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPropertyInfoPrompt',
  input: {schema: ExtractPropertyInfoInputSchema},
  output: {schema: ExtractPropertyInfoOutputSchema},
  prompt: `You are an expert at extracting structured data from web pages. Analyze the following HTML content from a real estate website and extract the details for all properties listed on the page.

Your goal is to populate all fields in the provided JSON schema.
- For 'title', 'description', 'price', 'location', 'area', and 'property_type', if you cannot find the information, return an empty string "".
- For 'bedrooms' and 'bathrooms', if you cannot find the information, return 0.
- For 'image_url', find a relevant, high-quality image URL from the HTML. If no suitable image URL is found, use the placeholder "https://placehold.co/600x400.png".
- Ensure the 'image_url' is a full, valid URL.

HTML Content:
\`\`\`html
{{{htmlContent}}}
\`\`\`

Extract the property information and return it in the specified JSON format. If no properties are found, return an empty array for the 'properties' field.`,
});

const extractPropertyInfoFlow = ai.defineFlow(
  {
    name: 'extractPropertyInfoFlow',
    inputSchema: ExtractPropertyInfoInputSchema,
    outputSchema: ExtractPropertyInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output ?? { properties: [] };
  }
);
