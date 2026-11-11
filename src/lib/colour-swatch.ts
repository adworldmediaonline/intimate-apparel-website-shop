import type { CSSProperties } from 'react';

/**
 * A visual swatch for a colour name from the catalogue.
 *
 * Colours are stored as free text on the product's "Colour" configuration
 * ("Navy Blue", "Red & Black", "Printed 02") — there is no hex code alongside
 * them. This maps the names in use to a swatch, splits a two-tone name into a
 * diagonal split of both halves, and falls back to a neutral chip for anything
 * unrecognised such as "Polkadot" or "Printed 01".
 */
const HEX: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  red: '#c62828',
  maroon: '#6d1f2c',
  pink: '#e87ea8',
  'baby pink': '#f4c2d0',
  'rose pink': '#d76a8c',
  purple: '#7b3fa0',
  blue: '#1f6fd0',
  'navy blue': '#1b2a56',
  navy: '#1b2a56',
  'royal blue': '#2b4fb5',
  'sky blue': '#87c3e8',
  turquoise: '#2fb5ab',
  green: '#2e7d42',
  yellow: '#f2c531',
  lemon: '#f5e56b',
  orange: '#ea7a2c',
  brown: '#6b4327',
  coffee: '#4a3227',
  beige: '#e3d5bf',
  cream: '#f5ecd9',
  grey: '#9a9a9a',
  gray: '#9a9a9a',
};

/** Neutral chip for names that describe a print rather than a colour. */
const UNKNOWN: CSSProperties = {
  background:
    'repeating-linear-gradient(45deg, var(--wf-cream-2) 0 4px, var(--wf-line) 4px 8px)',
};

function hexFor(name: string): string | undefined {
  return HEX[name.trim().toLowerCase()];
}

export function swatchForColour(label: string): CSSProperties {
  const name = String(label ?? '').trim();
  if (!name) return UNKNOWN;

  const direct = hexFor(name);
  if (direct) return { background: direct };

  // Two-tone names: "Red & Black", "Yellow & Blue". Both halves are shown so
  // the swatch is not silently wrong about which colour the piece is.
  const parts = name.split('&').map(p => p.trim());
  if (parts.length === 2) {
    const [a, b] = parts.map(hexFor);
    if (a && b) {
      return { background: `linear-gradient(135deg, ${a} 0 50%, ${b} 50% 100%)` };
    }
  }

  return UNKNOWN;
}

export default swatchForColour;
