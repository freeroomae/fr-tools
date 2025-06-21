"use client";

import Image from 'next/image';
import { BedDouble, Bath, Square, MapPin, Loader2, Sparkles } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Property } from '@/app/actions';

interface ResultsTableProps {
  properties: Property[];
  onEnhance: (property: Property) => void;
  isEnhancingId: string | null;
}

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
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Property</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((prop) => (
                <TableRow key={prop.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Image
                        src={prop.image_url}
                        alt={prop.title}
                        width={120}
                        height={80}
                        className="rounded-md object-cover"
                        data-ai-hint="property house"
                      />
                      <div className="font-medium">
                        <p className="font-bold truncate" title={prop.title}>{prop.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {prop.location}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                       <Badge variant="secondary">{prop.property_type}</Badge>
                       <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary/70" /> {prop.bedrooms} beds</span>
                       <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary/70" /> {prop.bathrooms} baths</span>
                       <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-primary/70" /> {prop.area}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-base">{prop.price}</TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button 
                              size="sm"
                              onClick={() => onEnhance(prop)} 
                              disabled={isEnhancingId === prop.id}
                            >
                              {isEnhancingId === prop.id ? 
                                <Loader2 className="h-4 w-4 animate-spin" /> :
                                <Sparkles className="h-4 w-4" />
                              }
                              <span className="sr-only">Enhance with AI</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enhance with AI</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
