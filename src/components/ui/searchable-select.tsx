'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  showManualEntry?: boolean;
  onManualEntry?: () => void;
  manualEntryLabel?: string;
}

const SearchableSelect = React.forwardRef<
  HTMLButtonElement,
  SearchableSelectProps
>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select an option...',
      searchPlaceholder = 'Search...',
      emptyMessage = 'No results found.',
      disabled = false,
      className,
      error = false,
      showManualEntry = false,
      onManualEntry,
      manualEntryLabel = 'Enter manually',
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedOption = options.find(option => option.value === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between font-normal',
              !selectedOption && 'text-muted-foreground',
              error && 'border-destructive focus-visible:ring-destructive',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[400px] p-0" align="start">
          <Command
            filter={(value, search, keywords) => {
              // Custom filter: case-insensitive search against both label and value
              const normalizedSearch = search.toLowerCase();
              const normalizedValue = value.toLowerCase();
              if (normalizedValue.includes(normalizedSearch)) {
                return 1;
              }
              // Also check keywords if provided
              if (keywords) {
                const keywordMatch = keywords.some((keyword) =>
                  keyword.toLowerCase().includes(normalizedSearch)
                );
                if (keywordMatch) {
                  return 1;
                }
              }
              return 0;
            }}
          >
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>
                <div className="py-2 text-center text-sm">
                  <p className="text-muted-foreground mb-2">{emptyMessage}</p>
                    {showManualEntry && onManualEntry && (
                    <button
                      type="button"
                      onClick={() => {
                        onManualEntry();
                        setOpen(false);
                      }}
                      className="text-primary hover:text-primary/80 underline text-sm font-medium"
                    >
                      {manualEntryLabel}
                    </button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    keywords={[option.label, option.value]}
                    onSelect={currentValue => {
                      const selectedOption = options.find(
                        opt => `${opt.label} ${opt.value}` === currentValue
                      );
                      if (selectedOption) {
                        onValueChange(selectedOption.value);
                      }
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';

export { SearchableSelect };

