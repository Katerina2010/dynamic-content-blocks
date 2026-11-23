import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FakeClock } from '../../../../../testing/fake-clock';
import { CLOCK } from '../../../../shared/time/clock.token';
import { StaticProductCatalogRepository } from '../../../products/data/repositories/static-product-catalog.repository';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { EntitlementId } from '../../../products/core/models/entitlement-id.type';
import { TariffId } from '../../../products/core/models/tariff-id.type';
import { ENTITLEMENT_QUERY } from '../../../products/core/tokens/entitlement-query.token';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { SUBSCRIPTION_CHECKOUT } from '../../../products/core/tokens/subscription-checkout.token';
import { StaticWebinarsRepository } from '../../data/repositories/static-webinars.repository';
import { WEBINARS_REFRESH_INTERVAL_MS } from '../tokens/webinars-refresh-interval.token';
import { WEBINARS_REPOSITORY } from '../tokens/webinars-repository.token';
import { WebinarsShowcaseFacade } from './webinars-showcase.facade';

const TECH_WEBINAR_ID = 'tech-2026-11-24-dark-side-of-ai';

describe('WebinarsShowcaseFacade: открытие checkout для вебинара', () => {
  const opened: CheckoutRequest[] = [];

  function setUp(now: string): WebinarsShowcaseFacade {
    opened.length = 0;
    TestBed.configureTestingModule({
      providers: [
        WebinarsShowcaseFacade,
        { provide: CLOCK, useValue: new FakeClock(now) },
        { provide: WEBINARS_REFRESH_INTERVAL_MS, useValue: 30_000 },
        { provide: WEBINARS_REPOSITORY, useClass: StaticWebinarsRepository },
        { provide: PRODUCT_CATALOG, useClass: StaticProductCatalogRepository },
        {
          provide: SUBSCRIPTION_CHECKOUT,
          useValue: { open: (request: CheckoutRequest) => opened.push(request) },
        },
        {
          provide: ENTITLEMENT_QUERY,
          useValue: {
            entitlements: signal<ReadonlySet<EntitlementId>>(new Set()),
            ownedTariffIds: signal<ReadonlySet<TariffId>>(new Set()),
            purchasesPersisted: signal(true),
          },
        },
      ],
    });
    return TestBed.inject(WebinarsShowcaseFacade);
  }

  it('до начала: открывает checkout с пояснением для действующих подписчиков', () => {
    setUp('2026-11-24T12:00:00+03:00').requestAccess(TECH_WEBINAR_ID);
    expect(opened).toHaveLength(1);
    expect(opened[0]).toMatchObject({
      kind: 'entitlement',
      entitlement: 'tech.webinars',
      subscriberNote:
        'Уже подписаны на The Bell.Tech или The Bell.Unlimited? Повторная покупка не нужна: ссылка на вебинар придёт на почту примерно за час до начала.',
    });
  });

  for (const now of ['2026-11-24T19:00:00+03:00', '2026-11-25T00:00:30+03:00']) {
    it(`не открывает checkout после начала вебинара или после даты события (${now})`, () => {
      setUp(now).requestAccess(TECH_WEBINAR_ID);
      expect(opened).toEqual([]);
    });
  }
});
