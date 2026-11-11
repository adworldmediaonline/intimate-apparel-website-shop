'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3 } from 'lucide-react';

type SpecificationItem = {
  yearRange?: string;
  driveType?: string;
  make?: string;
  model?: string;
};

type ChartButtonProps = {
  specifications?: string[] | SpecificationItem[] | string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

const parseSpecification = (
  spec: string | SpecificationItem
): SpecificationItem => {
  // If it's already an object, return it
  if (typeof spec !== 'string') {
    return spec;
  }

  // Parse string format: YEAR_RANGE:DRIVE_TYPE:MAKE:MODEL
  const parts = spec.split(':').map(part => part.trim());

  return {
    yearRange: parts[0] || '',
    driveType: parts[1] || '',
    make: parts[2] || '',
    model: parts[3]?.replace(/,/g, '').trim() || '', // Remove trailing comma
  };
};

const normalizeSpecifications = (
  specifications?: string[] | SpecificationItem[] | string
): SpecificationItem[] => {
  // Handle undefined or null
  if (!specifications) {
    return [];
  }

  // If it's a string, try to parse it
  if (typeof specifications === 'string') {
    // Check if it's a newline-separated string
    if (specifications.includes('\n')) {
      return specifications
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(parseSpecification);
    }
    // Single string specification
    return [parseSpecification(specifications)];
  }

  // If it's an array, map over it
  if (Array.isArray(specifications)) {
    return specifications.map(parseSpecification);
  }

  return [];
};

export const ChartButton = ({
  specifications = [],
  className = '',
  variant = 'outline',
  size = 'lg',
}: ChartButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize and parse specifications
  const parsedSpecs = normalizeSpecifications(specifications);

  // Always render the button (for testing - can be changed later)
  // The popover will show "No compatibility data available" if empty

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex-1 sm:flex-none ${className}`}
          aria-label="View compatibility chart"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Chart
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[90vw] sm:w-[600px] p-0"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col" style={{ maxHeight: '500px' }}>
          {/* Header */}
          <div className="p-4 border-b shrink-0 bg-background">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary shrink-0" />
              <h3 className="font-semibold text-foreground text-lg">
                Compatibility Chart
              </h3>
              {parsedSpecs.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shrink-0">
                  {parsedSpecs.length}
                </span>
              )}
            </div>
          </div>

          {/* Table Content - Scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full" style={{ height: '400px' }}>
              <div className="w-full">
                {/* Table Header */}
                <div className="sticky top-0 bg-background border-b z-10">
                  <div className="grid grid-cols-4 gap-4 p-3">
                    <div className="font-semibold text-sm text-foreground">
                      Year Range
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      Drive Type
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      Make
                    </div>
                    <div className="font-semibold text-sm text-foreground">
                      Model
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-border">
                  {parsedSpecs.length > 0 ? (
                    parsedSpecs.map((spec, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm text-foreground">
                          {spec.yearRange || '-'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {spec.driveType || '-'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {spec.make || '-'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {spec.model || '-'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No compatibility data available
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

