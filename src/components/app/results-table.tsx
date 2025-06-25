"use client";

import { useState } from 'react';
import Image from 'next/image';
import { BedDouble, Bath, Square, MapPin, Building, Globe, CheckCircle, FileText, Clock, Users, Sofa, List, Hash, ChevronDown, Mail, Phone, User, Award, ShieldCheck, FileKey, Building2, Images, Sparkles, Save, AlertCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type Property } from '@/app/actions';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { EnhanceDialog } from './enhance-dialog';

interface ResultsTableProps {
  properties: Property[];
  onSave: (property: Property) => void;
}

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
}

// Component for handling individual images with error states
const PropertyImage: React.FC<{
  src: string;
  alt: string;
  index: number;
  title: string;
}> = ({ src, alt, index, title }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log(`🖼️  [Frontend] Rendering image ${index + 1}: ${src}`);

  const handleError = () => {
    console.error(`❌ [Frontend] Failed to load image: ${src}`);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log(`✅ [Frontend] Successfully loaded image: ${src}`);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className="flex-shrink-0 w-[200px] h-[150px] bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Failed to load image</p>
          <p className="text-xs text-muted-foreground/70 break-all mt-1">{src}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 relative">
      {isLoading && (
        <div className="absolute inset-0 w-[200px] h-[150px] bg-muted rounded-md flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={200}
        height={150}
        className={`rounded-md object-cover h-[150px] ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        data-ai-hint="property house"
        onError={handleError}
        onLoad={handleLoad}
        unoptimized={src.includes('firebasestorage.googleapis.com')} // Disable optimization for Firebase URLs
      />
    </div>
  );
};

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0)) {
    return null;
  }
  
  const renderValue = () => {
    if (typeof value === 'string' && (value.includes('<p>') || value.includes('<li>'))) {
       return <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: value }} />;
    }
    if (typeof value === 'string' && value.startsWith('http')) {
        return (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
            {value}
            </a>
        );
    }
    return <span className="text-muted-foreground break-all">{String(value)}</span>;
  };
  
  return (
    <div className="flex items-start">
      <Icon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div>
        <span className="font-semibold">{label}: </span>
        {renderValue()}
      </div>
    </div>
  );
};

export function ResultsTable({ properties, onSave }: ResultsTableProps) {
  const [enhanceContent, setEnhanceContent] = useState<{ original: string, enhanced: string } | null>(null);

  if (properties.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground">No properties scraped yet. Start by scraping a URL, HTML, or a list of URLs.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Accordion type="single" collapsible className="w-full space-y-3">
      {properties.map((prop) => (
        <AccordionItem value={prop.id} key={prop.id} className="border rounded-lg bg-card overflow-hidden transition-all hover:border-primary/20">
          <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
             <div className="flex items-center justify-between gap-4 w-full text-left">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Image
                      src={prop.image_url || 'https://placehold.co/600x400.png'}
                      alt={prop.title}
                      width={120}
                      height={80}
                      className="rounded-md object-cover hidden sm:block"
                      data-ai-hint="property house"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-base" title={prop.title}>{prop.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        {prop.location}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="text-nowrap">{prop.property_type}</Badge>
                        <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary/70" /> {prop.bedrooms} beds</span>
                        <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary/70" /> {prop.bathrooms} baths</span>
                        <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-primary/70" /> {prop.area}</span>
                      </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 pl-4">
                    <p className="font-semibold text-lg text-primary text-right">{prop.price}</p>
                    <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground" />
                </div>
             </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4 pb-4 border-t pt-4 bg-muted/50 space-y-6">
              
              <div className='flex justify-end gap-2'>
                 <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEnhanceContent({ original: prop.original_description, enhanced: prop.description })}
                  >
                   <Sparkles className="mr-2" /> View AI Enhancement
                 </Button>
                 <Button size="sm" onClick={() => onSave(prop)}>
                   <Save className="mr-2" /> Save to Database
                  </Button>
              </div>
              <Separator />

              {prop.image_urls && prop.image_urls.length > 0 && (
                <>
                  <div>
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Images className="h-4 w-4"/> 
                      Image Gallery ({prop.image_urls.length} {prop.image_urls.length === 1 ? 'image' : 'images'})
                    </h4>
                    
                    {/* Debug info for non-placeholder images */}
                    {prop.image_urls.some(url => !url.includes('placehold.co')) && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <strong>🔍 Debug Info:</strong>
                        <ul className="mt-1 space-y-1">
                          {prop.image_urls.map((url, idx) => (
                            <li key={idx} className="font-mono text-blue-700 break-all">
                              Image {idx + 1}: {url.includes('placehold.co') ? '📷 Placeholder' : '🔗 Firebase URL'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4">
                      {prop.image_urls.map((url, index) => (
                        <PropertyImage
                          key={`${prop.id}-${index}`}
                          src={url || 'https://placehold.co/600x400.png'}
                          alt={`${prop.title} image ${index + 1}`}
                          index={index}
                          title={prop.title || 'Property'}
                        />
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div>
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2">Property Details</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                  <div className="space-y-3">
                    <DetailItem icon={Building} label="City" value={prop.city} />
                    <DetailItem icon={Globe} label="County" value={prop.county} />
                    <DetailItem icon={MapPin} label="Neighborhood" value={prop.neighborhood} />
                    <DetailItem icon={Hash} label="Floor" value={prop.floor_number} />
                  </div>
                  <div className="space-y-3">
                    <DetailItem icon={CheckCircle} label="For" value={prop.what_do} />
                    <DetailItem icon={Users} label="Tenant Type" value={prop.tenant_type} />
                    <DetailItem icon={Sofa} label="Furnishing" value={prop.furnish_type} />
                    <DetailItem icon={Clock} label="Rental Timing" value={prop.rental_timing} />
                  </div>
                  <div className="space-y-3">
                    <DetailItem icon={Building2} label="Building Info" value={prop.building_information} />
                    <DetailItem icon={FileText} label="Mortgage" value={prop.mortgage} />
                    <DetailItem icon={FileText} label="Terms" value={prop.terms_and_condition} />
                  </div>
                </div>
              </div>
              
              <Separator />

              <div>
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2"><FileKey className="h-4 w-4"/> Listing & Agency Details</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    <div className="space-y-3">
                        <DetailItem icon={Award} label="Reference ID" value={prop.reference_id} />
                        <DetailItem icon={FileKey} label="Permit Number" value={prop.permit_number} />
                        <DetailItem icon={FileKey} label="DED License" value={prop.ded_license_number} />
                    </div>
                    <div className="space-y-3">
                        <DetailItem icon={FileKey} label="RERA Registration" value={prop.rera_registration_number} />
                        <DetailItem icon={FileKey} label="DLD BRN" value={prop.dld_brn} />
                        <DetailItem icon={ShieldCheck} label="Validated Info" value={prop.validated_information} />
                    </div>
                     {prop.page_link && 
                        <div className="flex items-start">
                            <Globe className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <div>
                                <span className="font-semibold">Page Link: </span>
                                <a href={prop.page_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{prop.page_link}</a>
                            </div>
                        </div>
                      }
                </div>
              </div>
              
              <Separator />

              <div>
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2"><User className="h-4 w-4"/> Agent/Lister Information</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    <div className="space-y-3">
                        <DetailItem icon={User} label="Listed By" value={prop.listed_by_name} />
                    </div>
                    <div className="space-y-3">
                        <DetailItem icon={Phone} label="Phone" value={prop.listed_by_phone} />
                    </div>
                    <div className="space-y-3">
                        <DetailItem icon={Mail} label="Email" value={prop.listed_by_email} />
                    </div>
                </div>
              </div>
              
              {prop.features && prop.features.length > 0 && (
                <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2 text-base"><List className="h-4 w-4"/> Features & Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {prop.features.map((feature, index) => <Badge key={index} variant="outline">{feature}</Badge>)}
                  </div>
                </div>
                </>
              )}

              {prop.description && (
                <>
                <Separator />
                <div className="space-y-2">
                   <h4 className="font-semibold flex items-center gap-2 text-base">Description</h4>
                   <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: prop.description }} />
                </div>
                </>
              )}

              <Separator />
              
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>

    <EnhanceDialog 
      isOpen={!!enhanceContent}
      onClose={() => setEnhanceContent(null)}
      content={enhanceContent}
    />
    </>
  );
}
