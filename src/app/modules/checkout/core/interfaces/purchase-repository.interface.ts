import { Signal } from '@angular/core';
import { AddPurchaseResult } from '../models/add-purchase-result.type';
import { PersistenceStatus } from '../models/persistence-status.type';
import { Purchase } from '../models/purchase.interface';

/** Источник истины о завершённых покупках. */
export interface PurchaseRepository {
  readonly purchases: Signal<readonly Purchase[]>;
  readonly persistence: Signal<PersistenceStatus>;
  /**
   * Перечитывает исходное хранилище, чтобы решения учитывали покупки, сделанные
   * в другом месте (например, в другой вкладке) после последнего чтения.
   */
  refresh(): void;
  /** Добавляет покупку, если тот же тариф ещё не оформлен (после свежего чтения). */
  add(purchase: Purchase): AddPurchaseResult;
}
