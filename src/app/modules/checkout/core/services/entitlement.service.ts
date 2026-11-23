import { Injectable, computed, inject } from '@angular/core';
import { EntitlementQuery } from '../../../products/core/interfaces/entitlement-query.interface';
import { EntitlementId } from '../../../products/core/models/entitlement-id.type';
import { TariffId } from '../../../products/core/models/tariff-id.type';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { PURCHASE_REPOSITORY } from '../tokens/purchase-repository.token';

/** Выводит права из сохранённых покупок и текущих правил каталога. */
@Injectable()
export class EntitlementService implements EntitlementQuery {
  private readonly repository = inject(PURCHASE_REPOSITORY);
  private readonly catalog = inject(PRODUCT_CATALOG);

  readonly ownedTariffIds = computed<ReadonlySet<TariffId>>(
    () => new Set(this.repository.purchases().map((purchase) => purchase.tariffId)),
  );

  readonly entitlements = computed<ReadonlySet<EntitlementId>>(
    () =>
      new Set(
        this.repository
          .purchases()
          .flatMap((purchase) => this.catalog.tariff(purchase.tariffId)?.grants ?? []),
      ),
  );

  readonly purchasesPersisted = computed(() => this.repository.persistence() === 'persisted');
}
