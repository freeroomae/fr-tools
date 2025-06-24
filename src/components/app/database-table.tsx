"use client";

import { useState } from 'react';
import Image from 'next/image';
import { BedDouble, Bath, Square, MapPin, Building, Globe, CheckCircle, FileText, Clock, Users, Sofa, List, Hash, Mail, Phone, User, Award, ShieldCheck, FileKey, Building2, Images, MoreVertical, Trash2, Edit, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { type Property } from '@/app/actions';
import { Separator } from '@/components/ui/separator';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface DatabaseTableProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
  onEnhance: (property: Property) => void;
}

interface DetailItemProps {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  isLink?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, label, value, isLink = false }) => {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && value === 0)) {
    return null;
  }

  const renderValue = () => {
    if (isLink && typeof value === 'string' && value.startsWith('http')) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
          {value}
        </a>
      );
    }
    if (typeof value === 'string' && (value.includes('<p>') || value.includes('<li>'))) {
       return <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: value }} />;
    }
    return <span className="text-muted-foreground break-all">{String(value)}</span>;
  };
  
  return (
    <div className="flex items-start text-sm">
      <Icon className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div>
        <span className="font-semibold">{label}: </span>
        {renderValue()}
      </div>
    </div>
  );
};

export function DatabaseTable({ properties, onEdit, onDelete, onEnhance }: DatabaseTableProps) {
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  if (properties.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground">Your database is empty. Scrape some properties and save them to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <Card key={prop.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0 relative">
              <Image
                src={prop.image_url}
                alt={prop.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
                data-ai-hint="property house"
              />
               <div className="absolute top-2 right-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/70 hover:bg-background/90">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(prop)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEnhance(prop)}>
                            <Sparkles className="mr-2 h-4 w-4" /> Re-Enhance
                        </DropdownMenuItem>
                        {prop.original_url && prop.original_url.startsWith('http') && (
                            <DropdownMenuItem onSelect={() => window.open(prop.original_url, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" /> View Source
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => setDeleteCandidateId(prop.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1">
              <p className="font-bold text-lg leading-tight" title={prop.title}>{prop.title}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {prop.location}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4 text-primary/70" /> {prop.bedrooms} beds</span>
                  <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-primary/70" /> {prop.bathrooms} baths</span>
                  <span className="flex items-center gap-1.5"><Square className="h-4 w-4 text-primary/70" /> {prop.area}</span>
              </div>
               <p className="font-semibold text-xl text-primary mt-3">{prop.price}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
               {prop.description && (
                 <div className="space-y-2 w-full">
                   <h4 className="font-semibold flex items-center gap-2 text-base">Description</h4>
                   <div className="text-muted-foreground text-sm whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: prop.description.length > 150 ? prop.description.substring(0, 150) + '...' : prop.description }}></div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
       <AlertDialog open={!!deleteCandidateId} onOpenChange={(open) => !open && setDeleteCandidateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteCandidateId) {
                  onDelete(deleteCandidateId);
                }
                setDeleteCandidateId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
