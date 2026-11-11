/**
 * Maps category names to Lucide icons for the Shop by Category mega menu.
 * Used when rendering categories without images.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Cpu,
  Shirt,
  Watch,
  Heart,
  Home,
  Sparkles,
  Baby,
  UtensilsCrossed,
  BookOpen,
  Car,
  Gamepad2,
  Music,
  Camera,
  Dumbbell,
  Palette,
  LayoutGrid,
} from 'lucide-react';

/** Keywords (lowercase) mapped to Lucide icons */
const CATEGORY_ICON_MAP: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ['electronic', 'electronics', 'tech', 'technology', 'computer', 'laptop', 'phone', 'mobile'], icon: Cpu },
  { keywords: ['fashion', 'clothing', 'apparel', 'shirt', 'dress', 'wear'], icon: Shirt },
  { keywords: ['watch', 'watches', 'jewelry', 'jewellery', 'accessories'], icon: Watch },
  { keywords: ['beauty', 'cosmetic', 'skincare', 'makeup'], icon: Sparkles },
  { keywords: ['health', 'wellness', 'fitness', 'sport', 'sports'], icon: Heart },
  { keywords: ['home', 'furniture', 'decor', 'decoration', 'kitchen'], icon: Home },
  { keywords: ['baby', 'kids', 'children', 'child', 'toddler'], icon: Baby },
  { keywords: ['food', 'grocery', 'beverage', 'drink'], icon: UtensilsCrossed },
  { keywords: ['book', 'books', 'stationery', 'office'], icon: BookOpen },
  { keywords: ['auto', 'automotive', 'car', 'vehicle'], icon: Car },
  { keywords: ['game', 'gaming', 'toy', 'toys'], icon: Gamepad2 },
  { keywords: ['music', 'audio', 'instrument'], icon: Music },
  { keywords: ['camera', 'photo', 'photography'], icon: Camera },
  { keywords: ['gym', 'fitness', 'exercise'], icon: Dumbbell },
  { keywords: ['art', 'craft', 'hobby'], icon: Palette },
];

const FALLBACK_ICON = LayoutGrid;

/**
 * Returns the best-matching Lucide icon for a category name.
 * Uses keyword matching (case-insensitive); falls back to LayoutGrid if no match.
 */
export function getCategoryIcon(parentName: string): LucideIcon {
  if (!parentName || typeof parentName !== 'string') return FALLBACK_ICON;
  const normalized = parentName.toLowerCase().trim();
  if (!normalized) return FALLBACK_ICON;

  for (const { keywords, icon } of CATEGORY_ICON_MAP) {
    if (keywords.some((kw) => normalized.includes(kw))) return icon;
  }

  return FALLBACK_ICON;
}
