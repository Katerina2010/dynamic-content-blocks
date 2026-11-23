import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FakeClock } from '../../../../../testing/fake-clock';
import { CLOCK } from '../../../../shared/time/clock.token';
import { StaticProductCatalogRepository } from '../../data/repositories/static-product-catalog.repository';
import { CheckoutRequest } from '../models/checkout-request.type';
import { EntitlementId } from '../models/entitlement-id.type';
import { TariffId } from '../models/tariff-id.type';
import { ENTITLEMENT_QUERY } from '../tokens/entitlement-query.token';
import { PRODUCT_CATALOG } from '../tokens/product-catalog.token';
import { ROTATION_CONFIG } from '../tokens/rotation-config.token';
import { SUBSCRIPTION_CHECKOUT } from '../tokens/subscription-checkout.token';
import { ProductShowcaseFacade } from './product-showcase.facade';

describe('ProductShowcaseFacade: витрина продукта', () => {
  const opened: CheckoutRequest[] = [];
  let clock: FakeClock;
  let facade: ProductShowcaseFacade;
  const entitlements = signal<ReadonlySet<EntitlementId>>(new Set());
  const ownedTariffIds = signal<ReadonlySet<TariffId>>(new Set());

  beforeEach(() => {
    opened.length = 0;
    entitlements.set(new Set());
    ownedTariffIds.set(new Set());
    clock = new FakeClock('2026-11-22T23:59:00+03:00');
    TestBed.configureTestingModule({
      providers: [
        ProductShowcaseFacade,
        { provide: CLOCK, useValue: clock },
        { provide: PRODUCT_CATALOG, useClass: StaticProductCatalogRepository },
        {
          provide: ROTATION_CONFIG,
          useValue: {
            order: ['news', 'tech', 'invest', 'unlimited'],
            timeZone: 'Europe/Moscow',
            epochDay: '2026-01-01',
            refreshIntervalMs: 60_000,
          },
        },
        {
          provide: SUBSCRIPTION_CHECKOUT,
          useValue: { open: (request: CheckoutRequest) => opened.push(request) },
        },
        {
          provide: ENTITLEMENT_QUERY,
          useValue: {
            entitlements,
            ownedTariffIds,
            purchasesPersisted: signal(true),
          },
        },
      ],
    });
    facade = TestBed.inject(ProductShowcaseFacade);
  });

  it('меняет продукт после полуночи по Москве без пересоздания фасада', () => {
    expect(facade.viewFor({ mode: 'rotation' })?.product.id).toBe('tech');
    clock.set('2026-11-23T00:00:30+03:00');
    expect(facade.viewFor({ mode: 'rotation' })?.product.id).toBe('invest');
  });

  it('предлагает пробный тариф, если он есть у продукта, иначе ежемесячный', () => {
    expect(facade.viewFor({ mode: 'pinned', productId: 'tech' })?.offer).toBe(
      '$1 за первый месяц, далее $14,90 в месяц',
    );
    expect(facade.viewFor({ mode: 'pinned', productId: 'unlimited' })?.offer).toBe('$39 в месяц');
  });

  it('сообщает, что доступ уже включён, если продукт покрывает другая подписка', () => {
    const unlimited = new Set<EntitlementId>([
      'news.newsletters',
      'tech.newsletter',
      'tech.archive',
      'tech.webinars',
      'invest.newsletter',
      'invest.archive',
      'invest.webinars',
    ]);
    entitlements.set(unlimited);
    ownedTariffIds.set(new Set<TariffId>(['unlimited-monthly']));

    const tech = facade.viewFor({ mode: 'pinned', productId: 'tech' });
    expect(tech?.owned).toBe(false);
    expect(tech?.includedLabel).toBe('Доступ уже включён в вашу подписку');
    expect(facade.viewFor({ mode: 'pinned', productId: 'unlimited' })?.includedLabel).toBeNull();
  });

  it('не заявляет о включённом доступе, если продукт покрыт лишь частично (пробный Tech)', () => {
    entitlements.set(new Set<EntitlementId>(['tech.newsletter']));
    ownedTariffIds.set(new Set<TariffId>(['tech-trial']));
    const tech = facade.viewFor({ mode: 'pinned', productId: 'tech' });
    expect(tech?.owned).toBe(true);
    expect(tech?.includedLabel).toBeNull();
  });

  it('помечает покупку только пробного тарифа как пробную и сохраняет путь к платным тарифам', () => {
    entitlements.set(new Set<EntitlementId>(['tech.newsletter']));
    ownedTariffIds.set(new Set<TariffId>(['tech-trial']));
    const trial = facade.viewFor({ mode: 'pinned', productId: 'tech' });
    expect(trial?.ownedLabel).toBe('Оформлен пробный тариф');
    expect(trial?.ctaLabel).toBe('Тарифы и ваша подписка');

    ownedTariffIds.set(new Set<TariffId>(['tech-trial', 'tech-monthly']));
    expect(facade.viewFor({ mode: 'pinned', productId: 'tech' })?.ownedLabel).toBe(
      'Подписка оформлена',
    );
  });

  it('открывает checkout для продукта', () => {
    facade.subscribe('invest');
    expect(opened).toEqual([{ kind: 'product', productId: 'invest' }]);
  });
});
