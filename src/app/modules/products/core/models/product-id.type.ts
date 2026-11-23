export const PRODUCT_IDS = ['news', 'tech', 'invest', 'unlimited'] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export function isProductId(value: unknown): value is ProductId {
  return PRODUCT_IDS.some((id) => id === value);
}
