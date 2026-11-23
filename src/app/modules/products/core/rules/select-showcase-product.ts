import { calendarDayInZone } from '../../../../shared/time/calendar-day';
import { parseIsoDay } from '../../../../shared/time/parse-iso-day';
import { isProductId } from '../models/product-id.type';
import { RotationConfig } from '../models/rotation-config.interface';
import { ShowcaseSelection } from '../models/showcase-selection.type';
import { ShowcaseSettings } from '../models/showcase-settings.type';

export interface ShowcaseSelectionParams {
  readonly now: Date;
  readonly settings: ShowcaseSettings;
  readonly rotation: RotationConfig;
  /**
   * Продукты, которые ротация должна пропустить, например закреплённые в другом месте той же
   * страницы. Неизвестные id игнорируются. На корректное закрепление не влияет.
   */
  readonly exclude?: readonly string[];
}

/**
 * Детерминированный выбор продукта. Пул ротации — `rotation.order` без `exclude`.
 * Тот же календарный день в `rotation.timeZone` → тот же продукт; следующий местный день →
 * следующий продукт пула. Возвращает `null` для непригодной конфигурации ротации (пустой
 * порядок или некорректная эпоха) и когда исключены все продукты: тогда блок скрывается,
 * а не повторяет продукт, который уже есть на странице.
 */
export function selectShowcaseProduct(params: ShowcaseSelectionParams): ShowcaseSelection | null {
  const { now, settings, rotation, exclude = [] } = params;
  if (settings.mode === 'pinned' && isProductId(settings.productId)) {
    return { kind: 'pinned', productId: settings.productId };
  }

  const epoch = parseIsoDay(rotation.epochDay);
  const pool = rotation.order.filter((productId) => !exclude.includes(productId));
  if (pool.length === 0 || epoch === null) {
    return null;
  }

  const day = calendarDayInZone(now, rotation.timeZone) - epoch;
  const index = ((day % pool.length) + pool.length) % pool.length;
  const productId = pool[index];

  if (settings.mode === 'pinned') {
    return { kind: 'rotation-fallback', productId, day, invalidPin: settings.productId };
  }
  return { kind: 'rotation', productId, day };
}
