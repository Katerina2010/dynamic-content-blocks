import { StaticProductCatalogRepository } from '../../../products/data/repositories/static-product-catalog.repository';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { Purchase } from '../models/purchase.interface';
import { checkTariffEligibility } from './check-tariff-eligibility';

const catalog = new StaticProductCatalogRepository();
const TECH_PRODUCT: CheckoutRequest = { kind: 'product', productId: 'tech' };
const TECH_WEBINAR: CheckoutRequest = {
  kind: 'entitlement',
  entitlement: 'tech.webinars',
  contextProductId: 'tech',
  reason: 'Вебинар',
};

function purchase(tariffId: Purchase['tariffId'], productId: Purchase['productId']): Purchase {
  return { id: `p-${tariffId}`, tariffId, productId, purchasedAt: '2026-11-22T10:00:00Z' };
}

function check(request: CheckoutRequest, tariffId: string, purchases: Purchase[] = []): string {
  const result = checkTariffEligibility({ request, tariffId, catalog, purchases });
  return result.ok ? 'ok' : result.failure;
}

describe('checkTariffEligibility: допустимость покупки тарифа', () => {
  it('отклоняет неизвестные id тарифов', () => {
    expect(check(TECH_PRODUCT, 'tech-lifetime')).toBe('unknown-tariff');
    expect(check(TECH_PRODUCT, '')).toBe('unknown-tariff');
  });

  it('запрос product: тариф должен принадлежать продукту', () => {
    expect(check(TECH_PRODUCT, 'tech-monthly')).toBe('ok');
    expect(check(TECH_PRODUCT, 'unlimited-monthly')).toBe('product-mismatch');
  });

  it('запрос entitlement: подходит любой тариф, дающий право, в том числе из других продуктов', () => {
    expect(check(TECH_WEBINAR, 'tech-monthly')).toBe('ok');
    expect(check(TECH_WEBINAR, 'unlimited-yearly')).toBe('ok');
  });

  it('запрос entitlement: пробный тариф без нужного права отклоняется', () => {
    expect(check(TECH_WEBINAR, 'tech-trial')).toBe('entitlement-mismatch');
    expect(check(TECH_WEBINAR, 'invest-monthly')).toBe('entitlement-mismatch');
  });

  it('запрещает покупать один и тот же тариф дважды', () => {
    expect(check(TECH_PRODUCT, 'tech-monthly', [purchase('tech-monthly', 'tech')])).toBe(
      'already-owned',
    );
  });

  it('пробный тариф доступен только читателям без покупок этого продукта', () => {
    expect(check(TECH_PRODUCT, 'tech-trial')).toBe('ok');
    expect(check(TECH_PRODUCT, 'tech-trial', [purchase('tech-yearly', 'tech')])).toBe(
      'trial-not-eligible',
    );
    expect(check(TECH_PRODUCT, 'tech-trial', [purchase('unlimited-monthly', 'unlimited')])).toBe(
      'ok',
    );
  });

  it('разрешает переход с пробного тарифа, но не смену одного платного тарифа на другой', () => {
    expect(check(TECH_PRODUCT, 'tech-monthly', [purchase('tech-trial', 'tech')])).toBe('ok');
    expect(check(TECH_PRODUCT, 'tech-yearly', [purchase('tech-monthly', 'tech')])).toBe(
      'plan-change-unsupported',
    );
  });
});
