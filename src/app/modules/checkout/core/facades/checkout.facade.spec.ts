import { TestBed } from '@angular/core/testing';
import { FakeClock } from '../../../../../testing/fake-clock';
import { KEY_VALUE_STORAGE } from '../../../../shared/storage/key-value-storage.token';
import { MemoryStorage } from '../../../../shared/storage/memory-storage';
import { CLOCK } from '../../../../shared/time/clock.token';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { StaticProductCatalogRepository } from '../../../products/data/repositories/static-product-catalog.repository';
import {
  LocalPurchaseRepository,
  PURCHASES_STORAGE_KEY,
} from '../../data/repositories/local-purchase.repository';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';
import { ChargeRequest } from '../models/charge-request.interface';
import { PaymentResult } from '../models/payment-result.type';
import { EntitlementService } from '../services/entitlement.service';
import { CHECKOUT_CONFIG } from '../tokens/checkout-config.token';
import { PAYMENT_GATEWAY } from '../tokens/payment-gateway.token';
import { PURCHASE_REPOSITORY } from '../tokens/purchase-repository.token';
import { CheckoutFacade } from './checkout.facade';

/** Шлюз, ответы которого отпускаются вручную, чтобы проверять промежуточные состояния. */
class ControlledGateway implements PaymentGateway {
  readonly calls: ChargeRequest[] = [];
  private pending: { resolve: (result: PaymentResult) => void; reject: (error: Error) => void }[] =
    [];

  charge(request: ChargeRequest): Promise<PaymentResult> {
    this.calls.push(request);
    return new Promise((resolve, reject) => this.pending.push({ resolve, reject }));
  }

  respond(result: PaymentResult): void {
    this.pending.shift()?.resolve(result);
  }

  fail(error: Error): void {
    this.pending.shift()?.reject(error);
  }
}

const DETAILS = {
  email: 'reader@example.com',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/30',
  cvc: '123',
};
const APPROVED: PaymentResult = { status: 'approved', transactionId: 'tx-1' };
const TECH_PRODUCT: CheckoutRequest = { kind: 'product', productId: 'tech' };
const TECH_WEBINAR: CheckoutRequest = {
  kind: 'entitlement',
  entitlement: 'tech.webinars',
  contextProductId: 'tech',
  reason: 'Вебинар',
};

describe('CheckoutFacade: сценарий покупки', () => {
  let gateway: ControlledGateway;
  let facade: CheckoutFacade;
  let entitlements: EntitlementService;
  let storage: MemoryStorage;

  beforeEach(() => {
    gateway = new ControlledGateway();
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [
        CheckoutFacade,
        EntitlementService,
        { provide: PRODUCT_CATALOG, useClass: StaticProductCatalogRepository },
        { provide: PURCHASE_REPOSITORY, useClass: LocalPurchaseRepository },
        { provide: KEY_VALUE_STORAGE, useValue: storage },
        { provide: PAYMENT_GATEWAY, useValue: gateway },
        { provide: CLOCK, useValue: new FakeClock('2026-11-22T12:00:00Z') },
        {
          provide: CHECKOUT_CONFIG,
          useValue: { mode: 'demo', officialCheckouts: {}, processingDelayMs: 0, demoCards: [] },
        },
      ],
    });
    facade = TestBed.inject(CheckoutFacade);
    entitlements = TestBed.inject(EntitlementService);
  });

  async function payWith(result: PaymentResult): Promise<string> {
    const outcome = facade.pay(DETAILS);
    gateway.respond(result);
    return outcome;
  }

  it('завершает успешную покупку и выдаёт права только после неё', async () => {
    facade.open(TECH_WEBINAR);
    expect(facade.chooseTariff('tech-monthly')).toBe(true);
    expect(entitlements.entitlements().has('tech.webinars')).toBe(false);

    expect(await payWith(APPROVED)).toBe('approved');
    expect(facade.state()).toMatchObject({
      step: 'success',
      tariffId: 'tech-monthly',
      persisted: true,
    });
    expect(entitlements.entitlements().has('tech.webinars')).toBe(true);
    expect(gateway.calls[0]).toMatchObject({ tariffId: 'tech-monthly', amountCents: 1490 });
  });

  it('после отказа оставляет читателя на шаге оплаты и ничего не выдаёт', async () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-monthly');
    expect(await payWith({ status: 'declined', message: 'Отказ' })).toBe('declined');
    expect(facade.state()).toMatchObject({ step: 'payment', phase: { kind: 'declined' } });
    expect(entitlements.entitlements().size).toBe(0);
  });

  it('сообщает об ошибке шлюза, включая выброшенное исключение, и позволяет повторить оплату', async () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-monthly');
    expect(await payWith({ status: 'technical-error' })).toBe('error');
    expect(facade.state()).toMatchObject({ step: 'payment', phase: { kind: 'error' } });

    expect(await payWith(APPROVED)).toBe('approved');
    expect(gateway.calls).toHaveLength(2);
  });

  it('превращает исключение шлюза в техническую ошибку', async () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-monthly');
    const outcome = facade.pay(DETAILS);
    gateway.fail(new Error('network down'));
    expect(await outcome).toBe('error');
  });

  it('игнорирует повторную отправку, пока обрабатывается первая', async () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-monthly');
    const first = facade.pay(DETAILS);
    expect(facade.isSubmitting()).toBe(true);
    expect(await facade.pay(DETAILS)).toBe('ignored');
    gateway.respond(APPROVED);
    expect(await first).toBe('approved');
    expect(gateway.calls).toHaveLength(1);
  });

  it('не закрывается во время отправки платежа', () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-monthly');
    void facade.pay(DETAILS);
    facade.close();
    expect(facade.state().step).toBe('payment');
  });

  it('отклоняет неизвестные и неподходящие тарифы, переданные в фасад напрямую', () => {
    facade.open(TECH_PRODUCT);
    expect(facade.chooseTariff('tech-free-forever')).toBe(false);
    expect(facade.chooseTariff('unlimited-monthly')).toBe(false);
    expect(facade.state()).toMatchObject({
      step: 'tariffs',
      error: 'Этот тариф относится к другому продукту.',
    });
  });

  it('принимает Unlimited для Tech-вебинара, но не пробный тариф Tech', () => {
    facade.open(TECH_WEBINAR);
    const ids = facade.options().map((option) => option.tariff.id);
    expect(ids).toEqual([
      'tech-monthly',
      'tech-yearly',
      'unlimited-monthly',
      'unlimited-half-year',
      'unlimited-yearly',
    ]);
    expect(facade.excludedTrialNote()).toContain('со 2-го месяца');
    expect(facade.chooseTariff('tech-trial')).toBe(false);
  });

  it('не позволяет повторно купить тот же тариф', async () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-monthly');
    await payWith(APPROVED);
    facade.close();

    facade.open(TECH_PRODUCT);
    const owned = facade.options().find((option) => option.tariff.id === 'tech-monthly');
    expect(owned?.unavailableReason).toBe('Уже оформлен');
    expect(facade.chooseTariff('tech-monthly')).toBe(false);
  });

  it('не выдаёт пробному тарифу никаких прав на вебинары', async () => {
    facade.open(TECH_PRODUCT);
    facade.chooseTariff('tech-trial');
    await payWith(APPROVED);
    expect(entitlements.entitlements().has('tech.newsletter')).toBe(true);
    expect(entitlements.entitlements().has('tech.webinars')).toBe(false);
  });

  it('отмечает тарифы Tech как уже включённые для читателя с Unlimited, не блокируя их', async () => {
    facade.open({ kind: 'product', productId: 'unlimited' });
    facade.chooseTariff('unlimited-monthly');
    await payWith(APPROVED);
    facade.close();

    facade.open(TECH_PRODUCT);
    const options = facade.options();
    expect(options.every((option) => option.includedNote !== null)).toBe(true);
    expect(options.every((option) => option.unavailableReason === null)).toBe(true);
    expect(facade.chooseTariff('tech-monthly')).toBe(true);
  });

  it('предлагает перейти к оплате, только пока можно купить хотя бы один тариф (пробный, затем платный)', async () => {
    facade.open(TECH_PRODUCT);
    expect(facade.hasAvailableOption()).toBe(true);
    facade.chooseTariff('tech-trial');
    await payWith(APPROVED);
    facade.close();

    facade.open(TECH_PRODUCT);
    expect(facade.hasAvailableOption()).toBe(true);
    facade.chooseTariff('tech-monthly');
    await payWith(APPROVED);
    facade.close();

    facade.open(TECH_PRODUCT);
    expect(facade.options().every((option) => option.unavailableReason !== null)).toBe(true);
    expect(facade.hasAvailableOption()).toBe(false);
  });

  it('оставляет Tech доступным для покупки читателю с Unlimited, но не сам Unlimited', async () => {
    facade.open({ kind: 'product', productId: 'unlimited' });
    facade.chooseTariff('unlimited-yearly');
    await payWith(APPROVED);
    facade.close();

    facade.open({ kind: 'product', productId: 'unlimited' });
    expect(facade.hasAvailableOption()).toBe(false);
    facade.close();
    facade.open(TECH_PRODUCT);
    expect(facade.hasAvailableOption()).toBe(true);
  });

  describe('другая вкладка покупает в это же время (общее хранилище)', () => {
    function boughtInAnotherTab(tariffId: string, productId: string, notify = true): void {
      const payload = JSON.stringify({
        version: 1,
        purchases: [{ id: 'other-tab', tariffId, productId, purchasedAt: '2026-11-22T11:00:00Z' }],
      });
      if (notify) {
        storage.writeFromAnotherTab(PURCHASES_STORAGE_KEY, payload);
      } else {
        storage.write(PURCHASES_STORAGE_KEY, payload);
      }
    }

    it('перечитывает покупки при открытии checkout даже без события storage', () => {
      boughtInAnotherTab('tech-monthly', 'tech', false);
      facade.open(TECH_PRODUCT);
      const owned = facade.options().find((option) => option.tariff.id === 'tech-monthly');
      expect(owned?.unavailableReason).toBe('Уже оформлен');
    });

    it('ничего не списывает, если покупка стала недопустимой до оплаты', async () => {
      facade.open({ kind: 'product', productId: 'invest' });
      facade.chooseTariff('invest-trial');
      boughtInAnotherTab('invest-monthly', 'invest', false);

      expect(await facade.pay(DETAILS)).toBe('ineligible');
      expect(gateway.calls).toHaveLength(0);
      expect(facade.state()).toMatchObject({ step: 'tariffs' });
    });

    it('перепроверяет после ответа шлюза: при конфликте покупка не сохраняется и успех не показывается', async () => {
      facade.open({ kind: 'product', productId: 'invest' });
      facade.chooseTariff('invest-trial');
      const outcome = facade.pay(DETAILS);
      boughtInAnotherTab('invest-monthly', 'invest');
      gateway.respond(APPROVED);

      expect(await outcome).toBe('conflict');
      const state = facade.state();
      expect(state.step).toBe('tariffs');
      expect(state.step === 'tariffs' ? state.error : '').toContain('другой вкладке');
      expect(state.step === 'tariffs' ? state.error : '').toContain('не сохранена');
      const stored = storage.read(PURCHASES_STORAGE_KEY) ?? '';
      expect(stored).toContain('invest-monthly');
      expect(stored).not.toContain('invest-trial');
    });

    it('считает конфликтом тот же тариф, купленный в другой вкладке во время оплаты', async () => {
      facade.open(TECH_PRODUCT);
      facade.chooseTariff('tech-monthly');
      const outcome = facade.pay(DETAILS);
      boughtInAnotherTab('tech-monthly', 'tech');
      gateway.respond(APPROVED);

      expect(await outcome).toBe('conflict');
      expect(facade.state().step).toBe('tariffs');
      expect((storage.read(PURCHASES_STORAGE_KEY) ?? '').match(/tech-monthly/g)).toHaveLength(1);
      expect(entitlements.entitlements().has('tech.webinars')).toBe(true);
    });
  });
});
