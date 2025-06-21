"use client";

import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import type { Property } from '@/app/actions';

// Function to download data as a JSON file
export const downloadJson = (data: Property[], filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};

// Function to download data as a CSV file
export const downloadCsv = (data: Property[], filename: string) => {
  // Define headers for the CSV file
  const headers = [
    "id", "title", "price", "location", "bedrooms", "bathrooms",
    "area", "property_type", "description", "enhanced_description", "original_url",
    "mortgage", "neighborhood", "what_do", "city", "county", "tenant_type",
    "rental_timing", "furnish_type", "floor_number", "features", 
    "terms_and_condition", "page_link"
  ];

  const dataForCsv = data.map(prop => ({
      id: prop.id,
      title: prop.title,
      price: prop.price,
      location: prop.location,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: prop.area,
      property_type: prop.property_type,
      description: prop.description,
      enhanced_description: prop.enhanced_description || '',
      original_url: prop.original_url,
      mortgage: prop.mortgage,
      neighborhood: prop.neighborhood,
      what_do: prop.what_do,
      city: prop.city,
      county: prop.county,
      tenant_type: prop.tenant_type,
      rental_timing: prop.rental_timing,
      furnish_type: prop.furnish_type,
      floor_number: prop.floor_number,
      features: prop.features.join(', '),
      terms_and_condition: prop.terms_and_condition,
      page_link: prop.page_link,
  }));

  const worksheet = utils.json_to_sheet(dataForCsv, { header: headers });
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Properties');

  const csvOutput = write(workbook, { bookType: 'csv', type: 'string' });
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};
