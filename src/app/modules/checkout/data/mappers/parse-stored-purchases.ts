import { ProductCatalog } from '../../../products/core/interfaces/product-catalog.interface';
import { isTariffId } from '../../../products/core/models/tariff-id.type';
import { Purchase } from '../../core/models/purchase.interface';

export const PURCHASES_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toPurchase(raw: unknown, catalog: ProductCatalog): Purchase | null {
  if (!isRecord(raw)) {
    return null;
  }
  const { id, tariffId, productId, purchasedAt } = raw;
  if (typeof id !== 'string' || id.length === 0 || !isTariffId(tariffId)) {
    return null;
  }
  const tariff = catalog.tariff(tariffId);
  if (!tariff || tariff.productId !== productId) {
    return null;
  }
  if (typeof purchasedAt !== 'string' || Number.isNaN(Date.parse(purchasedAt))) {
    return null;
  }
  return { id, tariffId: tariff.id, productId: tariff.productId, purchasedAt };
}

/**
 * Превращает недоверенный сохранённый JSON в покупки. Повреждённый JSON, неверная структура
 * или версия дают пустой список; отдельные записи с неизвестными тарифами или несовпадающими
 * продуктами отбрасываются; из дубликатов тарифа остаётся первая запись.
 */
export function parseStoredPurchases(raw: string | null, catalog: ProductCatalog): Purchase[] {
  if (raw === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!isRecord(parsed) || parsed['version'] !== PURCHASES_SCHEMA_VERSION) {
    return [];
  }
  const items = parsed['purchases'];
  if (!Array.isArray(items)) {
    return [];
  }

  const result: Purchase[] = [];
  for (const item of items) {
    const purchase = toPurchase(item, catalog);
    if (purchase && !result.some((known) => known.tariffId === purchase.tariffId)) {
      result.push(purchase);
    }
  }
  return result;
}
