"use client";

import { ScanSearch } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card/50 backdrop-blur-lg border-b sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <ScanSearch className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            PropScrapeAI
          </h1>
        </div>
      </div>
    </header>
  );
}
