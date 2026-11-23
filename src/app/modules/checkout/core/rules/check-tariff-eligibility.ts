import { ProductCatalog } from '../../../products/core/interfaces/product-catalog.interface';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { isTariffId } from '../../../products/core/models/tariff-id.type';
import { EligibilityResult } from '../models/eligibility.type';
import { Purchase } from '../models/purchase.interface';

export interface EligibilityParams {
  readonly request: CheckoutRequest;
  /** Недоверенное значение: может прийти из прямого вызова фасада. */
  readonly tariffId: string;
  readonly catalog: ProductCatalog;
  readonly purchases: readonly Purchase[];
}

/**
 * Можно ли купить `tariffId` для `request`:
 * - тариф должен существовать в каталоге;
 * - запрос `product` → тариф должен принадлежать этому продукту;
 * - запрос `entitlement` → тариф должен давать это право (любой продукт, например Unlimited);
 * - один и тот же тариф нельзя купить дважды;
 * - пробный тариф — только для читателей без покупок этого продукта;
 * - переход между платными тарифами одного продукта не входит в MVP.
 */
export function checkTariffEligibility(params: EligibilityParams): EligibilityResult {
  const { request, tariffId, catalog, purchases } = params;
  const tariff = isTariffId(tariffId) ? catalog.tariff(tariffId) : undefined;
  if (!tariff) {
    return { ok: false, failure: 'unknown-tariff' };
  }

  if (request.kind === 'product' && tariff.productId !== request.productId) {
    return { ok: false, failure: 'product-mismatch' };
  }
  if (request.kind === 'entitlement' && !tariff.grants.includes(request.entitlement)) {
    return { ok: false, failure: 'entitlement-mismatch' };
  }

  if (purchases.some((purchase) => purchase.tariffId === tariff.id)) {
    return { ok: false, failure: 'already-owned' };
  }

  const sameProduct = purchases.filter((purchase) => purchase.productId === tariff.productId);
  if (tariff.kind === 'trial' && tariff.eligibility === 'new-customers-of-product') {
    return sameProduct.length > 0
      ? { ok: false, failure: 'trial-not-eligible' }
      : { ok: true, tariff };
  }

  const ownsRegular = sameProduct.some(
    (purchase) => catalog.tariff(purchase.tariffId)?.kind === 'recurring',
  );
  return ownsRegular ? { ok: false, failure: 'plan-change-unsupported' } : { ok: true, tariff };
}
