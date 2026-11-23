import { TestBed } from '@angular/core/testing';
import { FakeClock } from '../../../../../testing/fake-clock';
import { KEY_VALUE_STORAGE } from '../../../../shared/storage/key-value-storage.token';
import { MemoryStorage } from '../../../../shared/storage/memory-storage';
import { CLOCK } from '../../../../shared/time/clock.token';
import { provideProductsModule } from '../../../products/bootstrap/providers';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { TARIFF_IDS } from '../../../products/core/models/tariff-id.type';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { ENTITLEMENT_QUERY } from '../../../products/core/tokens/entitlement-query.token';
import { CheckoutFacade } from '../../core/facades/checkout.facade';
import { PaymentGateway } from '../../core/interfaces/payment-gateway.interface';
import { CheckoutMode } from '../../core/models/checkout-mode.type';
import { PAYMENT_GATEWAY } from '../../core/tokens/payment-gateway.token';
import { PURCHASE_REPOSITORY } from '../../core/tokens/purchase-repository.token';
import { PURCHASES_STORAGE_KEY } from '../../data/repositories/local-purchase.repository';
import { OFFICIAL_CHECKOUTS } from '../configuration/checkout.config';
import { provideCheckoutModule } from './index';

const DEMO_UNLIMITED_IN_STORAGE = JSON.stringify({
  version: 1,
  purchases: [
    {
      id: 'demo-1',
      tariffId: 'unlimited-monthly',
      productId: 'unlimited',
      purchasedAt: '2026-11-22T10:00:00.000Z',
    },
  ],
});
const TECH_WEBINAR: CheckoutRequest = {
  kind: 'entitlement',
  entitlement: 'tech.webinars',
  contextProductId: 'tech',
  reason: 'Вебинар',
};
const DETAILS = {
  email: 'reader@example.com',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/30',
  cvc: '123',
};

/** Подключает настоящие модули checkout и products в заданном режиме, как это делает app.config. */
function setUp(defaultMode: CheckoutMode): { facade: CheckoutFacade; gatewayCalls: number[] } {
  const gatewayCalls: number[] = [];
  const gateway: PaymentGateway = {
    charge: (request) => {
      gatewayCalls.push(request.amountCents);
      return Promise.resolve({ status: 'approved', transactionId: 'tx' });
    },
  };
  const storage = new MemoryStorage();
  storage.write(PURCHASES_STORAGE_KEY, DEMO_UNLIMITED_IN_STORAGE);
  TestBed.configureTestingModule({
    providers: [
      { provide: CLOCK, useValue: new FakeClock('2026-11-23T12:00:00+03:00') },
      { provide: KEY_VALUE_STORAGE, useValue: storage },
      provideProductsModule(),
      provideCheckoutModule({ defaultMode }),
      { provide: PAYMENT_GATEWAY, useValue: gateway },
    ],
  });
  return { facade: TestBed.inject(CheckoutFacade), gatewayCalls };
}

describe('Режимы checkout (с настоящим подключением модулей)', () => {
  it('Demo: использует демо-права этого браузера и mock-оплату', async () => {
    const { facade, gatewayCalls } = setUp('demo');
    expect(facade.mode).toBe('demo');
    expect(TestBed.inject(ENTITLEMENT_QUERY).entitlements().has('tech.webinars')).toBe(true);

    facade.open({ kind: 'product', productId: 'tech' });
    expect(facade.chooseTariff('tech-monthly')).toBe(true);
    expect(facade.state().step).toBe('payment');
    expect(await facade.pay(DETAILS)).toBe('approved');
    expect(gatewayCalls).toEqual([1490]);
    expect(facade.state().step).toBe('success');
  });

  it('Live: демо-покупки из localStorage никогда не считаются правами', () => {
    setUp('live');
    const access = TestBed.inject(ENTITLEMENT_QUERY);
    expect(access.entitlements().size).toBe(0);
    expect(access.ownedTariffIds().size).toBe(0);
    expect(TestBed.inject(PURCHASE_REPOSITORY).purchases()).toEqual([]);
  });

  it('Live: каждый из 13 тарифов ведёт на свой официальный checkout из allowlist', () => {
    const { facade } = setUp('live');
    for (const tariffId of TARIFF_IDS) {
      const productId = TestBed.inject(PRODUCT_CATALOG).tariff(tariffId)?.productId;
      expect(productId).toBeDefined();
      if (!productId) {
        continue;
      }
      facade.open({ kind: 'product', productId });
      expect(facade.chooseTariff(tariffId)).toBe(true);
      const state = facade.state();
      expect(state.step).toBe('redirect');
      expect(state.step === 'redirect' ? state.checkout : null).toBe(OFFICIAL_CHECKOUTS[tariffId]);
      facade.close();
    }
  });

  it('Live: Unlimited, выбранный для Tech-вебинара, ведёт на свой официальный URL оплаты', () => {
    const { facade } = setUp('live');
    facade.open(TECH_WEBINAR);
    expect(facade.chooseTariff('unlimited-monthly')).toBe(true);
    const state = facade.state();
    expect(state.step === 'redirect' ? state.checkout?.url : null).toBe(
      'https://thebell.io/checkout/c0977a668340c51cecc18e17e1e5a38477b189b6',
    );
  });

  it('Live: неизвестный тариф отклоняется и не получает ссылку на оплату', () => {
    const { facade } = setUp('live');
    facade.open({ kind: 'product', productId: 'invest' });
    expect(facade.chooseTariff('invest-free-forever')).toBe(false);
    expect(facade.state()).toMatchObject({ step: 'tariffs', error: 'Такого тарифа нет.' });
  });

  it('Live и Demo изолированы: переход в Live никогда не затрагивает демо-покупки', () => {
    const { facade } = setUp('live');
    facade.open({ kind: 'product', productId: 'unlimited' });
    facade.chooseTariff('unlimited-yearly');
    expect(TestBed.inject(KEY_VALUE_STORAGE).read(PURCHASES_STORAGE_KEY)).toBe(
      DEMO_UNLIMITED_IN_STORAGE,
    );

    TestBed.resetTestingModule();
    setUp('demo');
    expect(
      TestBed.inject(PURCHASE_REPOSITORY)
        .purchases()
        .map((p) => p.tariffId),
    ).toEqual(['unlimited-monthly']);
  });

  it('Live: не запрашивает карту, ничего не списывает, не показывает успех и не выдаёт права', async () => {
    const { facade, gatewayCalls } = setUp('live');
    facade.open({ kind: 'product', productId: 'tech' });
    facade.chooseTariff('tech-monthly');
    expect(facade.state().step).toBe('redirect');

    expect(await facade.pay(DETAILS)).toBe('ignored');
    expect(gatewayCalls).toEqual([]);
    expect(facade.state().step).toBe('redirect');
    expect(TestBed.inject(ENTITLEMENT_QUERY).entitlements().size).toBe(0);
  });

  it('Live: правила покупки действуют и до перехода (пробный тариф исключён для вебинара)', () => {
    const { facade } = setUp('live');
    facade.open(TECH_WEBINAR);
    expect(facade.chooseTariff('tech-trial')).toBe(false);
    expect(facade.state().step).toBe('tariffs');
  });

  it('показывает пояснение для действующих подписчиков только в Live и только если его передал вызывающий модуль', () => {
    const note = 'Уже подписаны? Повторная покупка не нужна.';
    const withNote: CheckoutRequest = { ...TECH_WEBINAR, subscriberNote: note };

    const live = setUp('live').facade;
    live.open(withNote);
    expect(live.subscriberNote()).toBe(note);
    live.open(TECH_WEBINAR);
    expect(live.subscriberNote()).toBeNull();
    live.open({ kind: 'product', productId: 'tech' });
    expect(live.subscriberNote()).toBeNull();

    TestBed.resetTestingModule();
    const demo = setUp('demo').facade;
    demo.open(withNote);
    expect(demo.subscriberNote()).toBeNull();
  });
});
