import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KEY_VALUE_STORAGE } from '../../../../shared/storage/key-value-storage.token';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { PurchaseRepository } from '../../core/interfaces/purchase-repository.interface';
import { AddPurchaseResult } from '../../core/models/add-purchase-result.type';
import { PersistenceStatus } from '../../core/models/persistence-status.type';
import { Purchase } from '../../core/models/purchase.interface';
import { PURCHASES_SCHEMA_VERSION, parseStoredPurchases } from '../mappers/parse-stored-purchases';

export const PURCHASES_STORAGE_KEY = 'dcb.purchases.v1';

/**
 * Покупки в хранилище браузера под версионированным ключом. Демо-замена billing API.
 *
 * Это хранилище общее для нескольких вкладок. Источник истины — сохранённый список:
 * он перечитывается при `refresh()`, перед каждой записью и когда его меняет другая вкладка
 * (событие `storage`). Поэтому вкладка никогда не перезаписывает покупки, сделанные в другом
 * месте, и не восстанавливает из устаревшей памяти записи, удалённые в другом месте. Сверх
 * сохранённого списка хранятся только собственные покупки этой вкладки, запись которых
 * не удалась (режим memory-only).
 *
 * Без транзакций: у localStorage нет блокировок и compare-and-set между вкладками.
 */
@Injectable()
export class LocalPurchaseRepository implements PurchaseRepository {
  private readonly storage = inject(KEY_VALUE_STORAGE);
  private readonly catalog = inject(PRODUCT_CATALOG);

  /** Покупки этой вкладки, которые не удалось записать; они живут до перезагрузки страницы. */
  private unsaved: readonly Purchase[] = [];

  private readonly purchasesSignal = signal<readonly Purchase[]>(this.readStored());
  private readonly persistenceSignal = signal<PersistenceStatus>('persisted');

  readonly purchases = this.purchasesSignal.asReadonly();
  readonly persistence = this.persistenceSignal.asReadonly();

  constructor() {
    this.storage
      .externalChanges(PURCHASES_STORAGE_KEY)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => {
        this.refresh();
      });
  }

  refresh(): void {
    this.purchasesSignal.set(withUnsaved(this.readStored(), this.unsaved));
  }

  add(purchase: Purchase): AddPurchaseResult {
    const stored = this.readStored();
    const current = withUnsaved(stored, this.unsaved);
    if (current.some((known) => known.tariffId === purchase.tariffId)) {
      this.purchasesSignal.set(current);
      return { kind: 'duplicate' };
    }

    const next = [...current, purchase];
    const persisted = this.storage.write(
      PURCHASES_STORAGE_KEY,
      JSON.stringify({ version: PURCHASES_SCHEMA_VERSION, purchases: next }),
    );
    // Успешная запись сохраняет и более ранние несохранённые покупки: они уже есть в `next`.
    this.unsaved = persisted ? [] : [...this.unsaved, purchase];
    this.purchasesSignal.set(next);
    this.persistenceSignal.set(persisted ? 'persisted' : 'memory-only');
    return { kind: 'added', persisted };
  }

  private readStored(): Purchase[] {
    return parseStoredPurchases(this.storage.read(PURCHASES_STORAGE_KEY), this.catalog);
  }
}

function withUnsaved(stored: readonly Purchase[], unsaved: readonly Purchase[]): Purchase[] {
  const extra = unsaved.filter((own) => !stored.some((known) => known.tariffId === own.tariffId));
  return [...stored, ...extra];
}
