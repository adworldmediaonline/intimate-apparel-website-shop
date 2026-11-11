'use client';

import { SearchIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

/**
 * Search as an icon, not a bar.
 *
 * The inline input took the middle third of the header on desktop and a whole
 * second row on a phone, on every page, for something most visits never use.
 * The icon opens a panel instead, so the search is one tap away and costs no
 * header height until it is wanted.
 *
 * Submits to /shop?search=, which is where the results and the search
 * analytics both live.
 */
export default function HeaderSearchButton({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open, and close on Escape — the panel covers the header, so
  // there has to be a way out that is not the small X.
  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const term = value.trim();
    if (!term) return;
    setOpen(false);
    setValue('');
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Search products"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-[var(--wf-brand)] text-[var(--wf-cream)] transition-colors hover:bg-[var(--wf-deep)] ${className ?? ''}`}
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      {open && (
        /* Full-bleed background, container-aligned contents: the bar now
           reaches both edges of the header while the input still lines up
           with the logo and the icons it covers. */
        <div className="absolute inset-x-0 top-0 z-50 h-full bg-header">
          <div className="container mx-auto flex h-full items-center gap-2 px-3 md:px-6">
            <form onSubmit={submit} className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              value={value}
              onChange={event => setValue(event.target.value)}
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              className="h-10 w-full rounded-full border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </form>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--wf-brand)] text-[var(--wf-cream)] hover:bg-[var(--wf-deep)]"
          >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
