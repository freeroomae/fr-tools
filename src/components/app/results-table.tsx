"use client";

import Image from 'next/image';
import { BedDouble, Bath, Square, MapPin, Loader2, Sparkles, Building, Globe, CheckCircle, FileText, Clock, Users, Sofa, List, Hash, ChevronDown, Mail, Phone, User, Award, ShieldCheck, FileKey, Building2, Images } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Property } from '@/app/actions';
import { Separator } from '@/components/ui/separator';

interface ResultsTableProps {
  properties: Property[];
  onEnhance: (property: Property) => void;
  isEnhancingId: string | null;
}

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value }) => {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0)) {
    return null;
  }
  return (
    <div className="flex items-start">
      <Icon className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div>
        <span className="font-semibold">{label}: </span>
        <span className="text-muted-foreground break-all">{String(value)}</span>
      </div>
    </div>
  );
};

export function ResultsTable({ properties, onEnhance, isEnhancingId }: ResultsTableProps) {
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
    <Accordion type="single" collapsible className="w-full space-y-3">
      {properties.map((prop) => (
        <AccordionItem value={prop.id} key={prop.id} className="border rounded-lg bg-card overflow-hidden transition-all hover:border-primary/20">
          <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
             <div className="flex items-center justify-between gap-4 w-full text-left">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Image
                      src={prop.image_url}
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
              
              {prop.image_urls && prop.image_urls.length > 0 && !prop.image_urls[0].includes('placehold.co') && (
                <>
                  <div>
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2"><Images className="h-4 w-4"/> Image Gallery</h4>
                    <div className="flex overflow-x-auto space-x-4 pb-2 -mx-4 px-4">
                      {prop.image_urls.map((url, index) => (
                        <div key={index} className="flex-shrink-0">
                          <Image
                            src={url}
                            alt={`${prop.title} image ${index + 1}`}
                            width={200}
                            height={150}
                            className="rounded-md object-cover h-[150px]"
                            data-ai-hint="property house"
                          />
                        </div>
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
                   <p className="text-muted-foreground text-sm whitespace-pre-wrap">{prop.description}</p>
                </div>
                </>
              )}

              <Separator />
              
              <div className="mt-2 flex justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => onEnhance(prop)}
                        disabled={!prop.original_description || isEnhancingId === prop.id}
                      >
                        {isEnhancingId === prop.id ?
                          <Loader2 className="h-4 w-4 animate-spin" /> :
                          <Sparkles className="h-4 w-4" />
                        }
                        <span className="ml-2">Enhance Content</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use AI to improve the property title and description.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
