import { Injectable, signal } from '@angular/core';
import { PurchaseRepository } from '../../core/interfaces/purchase-repository.interface';
import { AddPurchaseResult } from '../../core/models/add-purchase-result.type';
import { PersistenceStatus } from '../../core/models/persistence-status.type';
import { Purchase } from '../../core/models/purchase.interface';

/**
 * Режим Live. Настоящие права могут прийти только от backend The Bell, которого в этом
 * прототипе нет, поэтому подтверждённых покупок нет. Демо-покупки из localStorage здесь
 * никогда не читаются.
 */
@Injectable()
export class LivePurchaseRepository implements PurchaseRepository {
  readonly purchases = signal<readonly Purchase[]>([]).asReadonly();
  readonly persistence = signal<PersistenceStatus>('persisted').asReadonly();

  /** Перечитывать нечего: в режиме Live нет локального хранилища. */
  refresh(): void {
    // Намеренно пусто.
  }

  add(): AddPurchaseResult {
    throw new Error('Live mode never records purchases locally: payment happens on thebell.io.');
  }
}
