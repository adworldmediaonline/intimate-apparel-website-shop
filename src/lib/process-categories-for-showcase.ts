/**
 * Processes categories for Category Showcase display.
 * Uses showcaseGroups from each category (configured in Admin) to determine
 * how child categories are grouped or split into separate cards.
 * When showcaseGroups is empty: all children appear in one card (default).
 */

import { toSlug } from '@/lib/server-data';
import type { CategoryItem } from '@/lib/server-data';

/**
 * Expands a category into one or more showcase cards based on showcaseGroups.
 * - No showcaseGroups: one card with all children
 * - With showcaseGroups: one card per group; unassigned children in a final card
 */
export function processCategoriesForShowcase(categories: CategoryItem[]): CategoryItem[] {
  const result: CategoryItem[] = [];

  for (const cat of categories) {
    const parentSlug = toSlug(cat.parent || '');
    // Sub-categories were removed from the storefront: the shop filters no
    // longer list them and the menus no longer link to them, so a showcase
    // that still split one category into several cards sent shoppers to
    // filters that no longer exist. The grouping code below is kept whole
    // and simply never has children to work with.
    const children: string[] = [];
    const groups = Array.isArray(cat.showcaseGroups) ? cat.showcaseGroups : [];
    const parentImage = cat.image?.url || cat.img;
    const parentImageMeta = cat.image;

    if (children.length === 0) {
      result.push({
        ...cat,
        parentCategorySlug: parentSlug,
      });
      continue;
    }

    const assignedChildren = new Set<string>();

    if (groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const groupChildren = Array.isArray(group?.children) ? group.children : [];
        if (groupChildren.length === 0) continue;

        groupChildren.forEach((c) => assignedChildren.add(c));

        const childSlugs = groupChildren.map((c) => toSlug(c)).filter(Boolean);
        const subcategorySlug = childSlugs.join(',');
        const groupImage = group.image?.url;
        const groupImageMeta = group.image;

        const cardImage = groupImage || parentImage;
        const cardImageMeta = groupImageMeta || parentImageMeta;

        result.push({
          _id: `${cat._id}-group-${i}`,
          parent: cat.parent,
          description: cat.description,
          img: cardImage,
          image: cardImageMeta
            ? {
                url: cardImageMeta.url,
                fileName: cardImageMeta.fileName,
                title: cardImageMeta.title,
                altText: cardImageMeta.altText,
              }
            : undefined,
          status: cat.status,
          products: cat.products,
          children: groupChildren,
          parentCategorySlug: parentSlug,
          subcategorySlug,
        });
      }
    }

    const unassigned = children.filter((c) => !assignedChildren.has(c));
    if (unassigned.length > 0) {
      const childSlugs = unassigned.map((c) => toSlug(c)).filter(Boolean);
      result.push({
        _id: `${cat._id}-group-default`,
        parent: cat.parent,
        description: cat.description,
        img: parentImage,
        image: parentImageMeta,
        status: cat.status,
        products: cat.products,
        children: unassigned,
        parentCategorySlug: parentSlug,
        subcategorySlug: childSlugs.join(','),
      });
    } else if (groups.length === 0) {
      const childSlugs = children.map((c) => toSlug(c)).filter(Boolean);
      result.push({
        ...cat,
        _id: cat._id,
        parentCategorySlug: parentSlug,
        subcategorySlug: childSlugs.join(','),
      });
    }
  }

  return result;
}
