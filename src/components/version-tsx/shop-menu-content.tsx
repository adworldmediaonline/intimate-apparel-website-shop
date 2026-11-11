'use client';

import { ChevronRight, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';
import * as React from 'react';

export interface CategoryItem {
  _id: string;
  parent: string;
  status?: string;
  products?: unknown[];
  children?: string[];
  img?: string;
}

export interface ShopMenuContentProps {
  categories: CategoryItem[];
  onSelectCategory: (parent: string) => void;
  onSelectSubcategory: (parent: string, child: string) => void;
}

// Reusable dropdown content for the Shop menu. Pure presentational with callbacks
export function ShopMenuContent({
  categories,
  onSelectCategory,
  onSelectSubcategory,
}: ShopMenuContentProps): React.ReactElement {
  return (
    <div
      className="max-h-[min(80vh,28rem)] overflow-y-auto"
      role="menu"
      aria-label="Shop categories"
    >
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(10rem,1fr))]">
        {categories.map(categoryItem => (
          <div
            key={categoryItem._id}
            className="rounded-lg p-3 transition-shadow duration-200 hover:shadow-md focus-within:shadow-md"
          >
            <button
              type="button"
              onClick={() => onSelectCategory(categoryItem.parent)}
              className="group block w-full"
              aria-label={`Open ${categoryItem.parent}`}
            >
              <div className="relative overflow-hidden rounded-md bg-muted">
                <div className="relative aspect-[4/3] w-full">
                  {categoryItem.img ? (
                    <NextImage
                      src={categoryItem.img}
                      alt={categoryItem.parent}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px"
                      className="object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon
                        className="h-6 w-6 text-muted-foreground"
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 text-center text-xs md:text-sm font-bold uppercase tracking-wider">
                {categoryItem.parent}
              </div>
            </button>

            {Array.isArray(categoryItem.children) &&
            categoryItem.children.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {categoryItem.children.slice(0, 8).map((child, index) => (
                  <button
                    key={`${categoryItem._id}-${index}`}
                    className="inline-flex w-full items-center justify-between rounded-full border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover"
                    onClick={() =>
                      onSelectSubcategory(categoryItem.parent, child)
                    }
                    type="button"
                  >
                    <span className="pr-2">{child}</span>
                    <ChevronRight
                      className="h-3.5 w-3.5 opacity-60"
                      aria-hidden
                    />
                  </button>
                ))}

                {categoryItem.children.length > 8 && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(categoryItem.parent)}
                    className="inline-flex w-full items-center justify-center rounded-full border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover col-span-2"
                  >
                    More
                  </button>
                )}
              </div>
            ) : (
              <button
                className="mt-3 inline-flex items-center rounded-full border border-border/40 bg-muted/20 px-3 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover whitespace-nowrap"
                onClick={() => onSelectCategory(categoryItem.parent)}
                type="button"
              >
                Browse
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShopMenuContent;
