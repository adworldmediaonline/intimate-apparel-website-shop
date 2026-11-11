import brandConfig from '../../brand.config.json';

/**
 * Shown on every policy page. A single value in brand.config.json rather
 * than `new Date()`: an effective date that silently changes every morning
 * tells the reader nothing about when the terms actually changed.
 */
export const LEGAL_EFFECTIVE_DATE =
  (brandConfig as { compliance?: { legalEffectiveDate?: string } }).compliance
    ?.legalEffectiveDate ?? '';
