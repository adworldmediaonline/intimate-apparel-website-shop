/**
 * Size guide data, shared by the dialog on the product page and the standalone
 * /size-guide page so the two can never disagree.
 *
 * The measurement chart is the full XS-5XL range. Note the catalogue currently
 * sells S-XL only (SIZE_OPTIONS in backend/scripts/add-product-sizes.js), so a
 * shopper measuring XS or 2XL+ cannot pick that size at checkout — run that
 * script with the wider range to close the gap.
 */
export interface SizeRow {
  size: string;
  bust: string;
  waist: string;
  hips: string;
}

export const SIZE_MEASUREMENTS: SizeRow[] = [
  { size: 'XS', bust: '30-32in', waist: '24-26in', hips: '34-36in' },
  { size: 'S', bust: '32-34in', waist: '26-28in', hips: '36-38in' },
  { size: 'M', bust: '34-36in', waist: '28-30in', hips: '38-40in' },
  { size: 'L', bust: '36-38in', waist: '30-32in', hips: '40-42in' },
  { size: 'XL', bust: '38-40in', waist: '32-34in', hips: '42-44in' },
  { size: '2XL', bust: '40-42in', waist: '34-36in', hips: '44-46in' },
  { size: '3XL', bust: '42-44in', waist: '36-38in', hips: '46-48in' },
  { size: '4XL', bust: '44-46in', waist: '38-40in', hips: '48-50in' },
  { size: '5XL', bust: '46-48in', waist: '40-42in', hips: '50-52in' },
];

export const BRA_SIZE_MAPPING: { bra: string; pick: string }[] = [
  { bra: '32A – 32B', pick: 'S' },
  { bra: '34A – 34B', pick: 'M' },
  { bra: '34C – 36B', pick: 'L' },
  { bra: '36C – 38B', pick: 'XL' },
];

export const HOW_TO_MEASURE: { label: string; body: string }[] = [
  {
    label: 'Bust',
    body: 'Measure around the fullest part of your chest, keeping the tape level and relaxed.',
  },
  {
    label: 'Waist',
    body: 'Wrap the tape around the narrowest part of your torso, just above the belly button.',
  },
  {
    label: 'Hips',
    body: 'Stand with feet together. Measure around the fullest part of your hips, usually 8 inches below your waist.',
  },
];

export const BETWEEN_SIZES_NOTE =
  'Between two? Pick the bigger one — lace forgives.';

export const STRETCH_NOTE =
  'Between two sizes? Our fabrics stretch — size down for snugger, up for comfort.';
