/**
 * Configuration price override logic.
 * When a product has configurationPriceOverrides and the user's selected
 * configuration combination matches a rule, return the override price instead
 * of the sum of selected option prices.
 */

export interface ConfigurationPriceOverrideMatch {
  configIndex: number;
  optionName: string;
}

export interface ConfigurationPriceOverride {
  match: ConfigurationPriceOverrideMatch[];
  overridePrice: number;
}

export interface ProductWithOverrides {
  configurationPriceOverrides?: ConfigurationPriceOverride[];
}

export interface SelectedConfigurationEntry {
  option?: { name?: string };
}

/**
 * Returns the override price if the current selection matches any override rule.
 * First match wins. Returns null if no override applies.
 */
export function getConfigurationOverridePrice(
  product: ProductWithOverrides,
  selectedConfigurations: Record<number, SelectedConfigurationEntry>
): number | null {
  const overrides = product.configurationPriceOverrides;
  if (!overrides || !Array.isArray(overrides) || overrides.length === 0) {
    return null;
  }

  for (const rule of overrides) {
    const match = rule.match;
    if (!match || match.length === 0) continue;

    const allMatch = match.every(({ configIndex, optionName }) => {
      const sel = selectedConfigurations[configIndex];
      const selectedName = sel?.option?.name?.trim?.() ?? '';
      return selectedName === (optionName?.trim?.() ?? '');
    });

    if (allMatch) {
      return rule.overridePrice ?? null;
    }
  }

  return null;
}
