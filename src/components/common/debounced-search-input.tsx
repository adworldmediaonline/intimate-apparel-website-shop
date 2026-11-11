'use client';

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

interface DebouncedSearchInputProps {
  initialValue?: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  disabled?: boolean;
}

const DebouncedSearchInput = ({
  initialValue = '',
  onSearchChange,
  placeholder = 'Search...',
  className = '',
  debounceMs = 350,
  disabled = false,
}: DebouncedSearchInputProps) => {
  const [searchValue, setSearchValue] = useState(initialValue);

  // Sync with external changes
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  // Debounce search commits
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim() !== initialValue) {
        onSearchChange(searchValue.trim());
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchValue, initialValue, onSearchChange, debounceMs]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = searchValue.trim();
      if (trimmed) {
        onSearchChange(trimmed);
      }
    },
    [searchValue, onSearchChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmed = searchValue.trim();
        if (trimmed) {
          onSearchChange(trimmed);
        }
      }
    },
    [searchValue, onSearchChange]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Input
        type="search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        aria-label="Search products"
      />
    </form>
  );
};

export default DebouncedSearchInput;

