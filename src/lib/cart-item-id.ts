/**
 * Generates a unique cart item ID for products with optional configs.
 * Used to differentiate cart line items: same product _id with different
 * configurations or custom notes should be separate cart entries.
 */

interface CartItemIdentity {
  _id: string;
  selectedOption?: { title: string; price: number };
  selectedConfigurations?: Record<
    number,
    { optionIndex: number; option: { name: string; price: number } }
  >;
  customNotes?: Record<number, string>;
}

export function getCartItemId(item: CartItemIdentity): string {
  let id = item._id;

  if (item.selectedOption) {
    id += `-option-${item.selectedOption.title}`;
  }

  if (item.selectedConfigurations && Object.keys(item.selectedConfigurations).length > 0) {
    const configKey = JSON.stringify(
      Object.keys(item.selectedConfigurations)
        .sort()
        .reduce(
          (acc, k) => {
            const v = item.selectedConfigurations![Number(k)];
            acc[k] = v ? { optionIndex: v.optionIndex, optionName: v.option?.name } : {};
            return acc;
          },
          {} as Record<string, unknown>
        )
    );
    id += `-config-${configKey}`;
  }

  if (item.customNotes && Object.keys(item.customNotes).length > 0) {
    const notesKey = JSON.stringify(item.customNotes);
    id += `-notes-${notesKey}`;
  }

  return id;
}
