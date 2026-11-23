import { Signal } from '@angular/core';
import { EntitlementId } from '../models/entitlement-id.type';
import { TariffId } from '../models/tariff-id.type';

/** Порт, отвечающий на вопрос «чем читатель владеет сейчас». Реализуется модулем checkout. */
export interface EntitlementQuery {
  /** Права, выведенные из сохранённых покупок и текущих правил каталога. */
  readonly entitlements: Signal<ReadonlySet<EntitlementId>>;
  readonly ownedTariffIds: Signal<ReadonlySet<TariffId>>;
  /** False, когда покупки живут только в памяти и пропадут после перезагрузки. */
  readonly purchasesPersisted: Signal<boolean>;
}
