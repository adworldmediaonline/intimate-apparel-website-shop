'use client';

import React from 'react';

export interface HelloTailwindProps {
  title?: string;
  subtitle?: string;
}

/**
 * Simple TSX component to verify Tailwind + TS are wired.
 * Uses a few utilities and is client-safe.
 */
export function HelloTailwind({
  title = 'Hello world!',
  subtitle = 'Tailwind + TypeScript are working.',
}: HelloTailwindProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">
        {subtitle}
      </p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-1 text-white dark:bg-white dark:text-black">
        <span className="text-xs font-medium">Next 15</span>
        <span className="text-xs">•</span>
        <span className="text-xs font-medium">React 18</span>
        <span className="text-xs">•</span>
        <span className="text-xs font-medium">Tailwind v4</span>
      </div>
    </section>
  );
}

export default HelloTailwind;
