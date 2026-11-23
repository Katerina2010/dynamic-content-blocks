import { Injectable, computed, inject, signal } from '@angular/core';
import { CLOCK } from '../../../../shared/time/clock.token';
import { SubscriptionCheckout } from '../../../products/core/interfaces/subscription-checkout.interface';
import { CheckoutRequest } from '../../../products/core/models/checkout-request.type';
import { Tariff } from '../../../products/core/models/tariff.interface';
import { TariffId } from '../../../products/core/models/tariff-id.type';
import { describePrice } from '../../../products/core/rules/describe-price';
import { PRODUCT_CATALOG } from '../../../products/core/tokens/product-catalog.token';
import { CheckoutSelection } from '../models/checkout-selection.interface';
import { CheckoutState } from '../models/checkout-state.type';
import { PayOutcome } from '../models/pay-outcome.type';
import { PaymentDetails } from '../models/payment-details.interface';
import { PaymentResult } from '../models/payment-result.type';
import { TariffOption } from '../models/tariff-option.interface';
import { checkTariffEligibility } from '../rules/check-tariff-eligibility';
import { describeEligibilityFailure } from '../rules/describe-eligibility-failure';
import { EntitlementService } from '../services/entitlement.service';
import { CHECKOUT_CONFIG } from '../tokens/checkout-config.token';
import { PAYMENT_GATEWAY } from '../tokens/payment-gateway.token';
import { PURCHASE_REPOSITORY } from '../tokens/purchase-repository.token';

const TECHNICAL_ERROR_MESSAGE =
  'Платёжный сервис не ответил. Доступ не выдан, деньги не списаны — попробуйте ещё раз.';

const INCLUDED_NOTE = 'Доступ уже включён в вашу подписку';

const TRIAL_EXCLUDED_NOTE =
  'Пробный тариф здесь не предлагается: вебинары и полный архив он открывает только со 2-го месяца, когда подписка переходит на полную стоимость.';

/** После одобренного демо-списания покупка оказалась недопустимой (изменения в другой вкладке). */
function conflictMessage(reason: string): string {
  return `Пока шла оплата, подписки изменились в другой вкладке: «${reason}». Эта демо-покупка не сохранена, доступ не выдан; деньги в демо не списываются.`;
}

/**
 * Общий сценарий checkout для всех блоков: тарифы → оплата → успех.
 * Все правила покупки выполняются здесь, поэтому UI и прямые вызовы проверяются одинаково.
 */
@Injectable()
export class CheckoutFacade implements SubscriptionCheckout {
  private readonly catalog = inject(PRODUCT_CATALOG);
  private readonly repository = inject(PURCHASE_REPOSITORY);
  private readonly gateway = inject(PAYMENT_GATEWAY);
  private readonly clock = inject(CLOCK);
  private readonly access = inject(EntitlementService);

  private readonly stateSignal = signal<CheckoutState>({ step: 'closed' });

  readonly state = this.stateSignal.asReadonly();
  private readonly config = inject(CHECKOUT_CONFIG);
  readonly mode = this.config.mode;
  readonly demoCards = this.config.demoCards;

  readonly isSubmitting = computed(() => {
    const state = this.stateSignal();
    return state.step === 'payment' && state.phase.kind === 'submitting';
  });

  readonly heading = computed(() => {
    const state = this.stateSignal();
    if (state.step === 'closed') {
      return '';
    }
    if (state.request.kind === 'entitlement') {
      return state.request.reason;
    }
    return this.catalog.product(state.request.productId)?.name ?? '';
  });

  /** Тарифы для текущего запроса в порядке каталога, с признаком доступности. */
  readonly options = computed<readonly TariffOption[]>(() => {
    const state = this.stateSignal();
    if (state.step !== 'tariffs') {
      return [];
    }
    const purchases = this.repository.purchases();
    const owned = this.access.entitlements();
    return this.candidateTariffs(state.request).flatMap((tariff) => {
      const product = this.catalog.product(tariff.productId);
      if (!product) {
        return [];
      }
      const check = checkTariffEligibility({
        request: state.request,
        tariffId: tariff.id,
        catalog: this.catalog,
        purchases,
      });
      return [
        {
          tariff,
          product,
          priceLabel: describePrice(tariff),
          unavailableReason: check.ok ? null : describeEligibilityFailure(check.failure),
          includedNote:
            check.ok && tariff.grants.every((grant) => owned.has(grant)) ? INCLUDED_NOTE : null,
        },
      ];
    });
  });

  /**
   * False, когда ни один из предложенных тарифов нельзя купить
   * (например, всё доступное уже оформлено).
   */
  readonly hasAvailableOption = computed(() =>
    this.options().some((option) => option.unavailableReason === null),
  );

  /** Для запросов по праву: пробные тарифы продукта из контекста, которые не дают это право. */
  readonly excludedTrialNote = computed(() => {
    const state = this.stateSignal();
    if (state.step !== 'tariffs' || state.request.kind !== 'entitlement') {
      return null;
    }
    const { entitlement, contextProductId } = state.request;
    const excluded = this.catalog
      .tariffsOf(contextProductId)
      .some((tariff) => tariff.kind === 'trial' && !tariff.grants.includes(entitlement));
    return excluded ? TRIAL_EXCLUDED_NOTE : null;
  });

  /**
   * Только Live: в Live нет настоящих прав, поэтому читателю, который уже подписан
   * в другом месте, напоминают, что платить второй раз не нужно. Demo вместо этого
   * показывает собственные демо-права и никогда не показывает это пояснение.
   */
  readonly subscriberNote = computed(() => {
    const state = this.stateSignal();
    if (this.mode !== 'live' || state.step !== 'tariffs' || state.request.kind !== 'entitlement') {
      return null;
    }
    return state.request.subscriberNote ?? null;
  });

  readonly selection = computed<CheckoutSelection | null>(() => {
    const state = this.stateSignal();
    if (state.step !== 'payment' && state.step !== 'redirect' && state.step !== 'success') {
      return null;
    }
    return this.selectionFor(state.tariffId);
  });

  open(request: CheckoutRequest): void {
    if (this.isSubmitting()) {
      return;
    }
    this.repository.refresh();
    this.stateSignal.set({ step: 'tariffs', request, error: null });
  }

  /** Проверяет недоверенный id тарифа на соответствие текущему запросу и покупкам. */
  chooseTariff(tariffId: string): boolean {
    const state = this.stateSignal();
    if (state.step !== 'tariffs') {
      return false;
    }
    this.repository.refresh();
    const check = checkTariffEligibility({
      request: state.request,
      tariffId,
      catalog: this.catalog,
      purchases: this.repository.purchases(),
    });
    if (!check.ok) {
      this.stateSignal.set({ ...state, error: describeEligibilityFailure(check.failure) });
      return false;
    }
    if (this.mode === 'live') {
      // Ни формы карты, ни списания, ни локальной покупки: дальше работает официальный checkout.
      this.stateSignal.set({
        step: 'redirect',
        request: state.request,
        tariffId: check.tariff.id,
        checkout: this.config.officialCheckouts[check.tariff.id] ?? null,
      });
      return true;
    }
    this.stateSignal.set({
      step: 'payment',
      request: state.request,
      tariffId: check.tariff.id,
      phase: { kind: 'idle' },
    });
    return true;
  }

  backToTariffs(): void {
    const state = this.stateSignal();
    const canLeave =
      state.step === 'redirect' || (state.step === 'payment' && state.phase.kind !== 'submitting');
    if (!canLeave) {
      return;
    }
    this.stateSignal.set({ step: 'tariffs', request: state.request, error: null });
  }

  /**
   * Только режим Demo: отправляет или повторяет оплату. Параллельные отправки и режим Live
   * игнорируются. Покупки перечитываются перед списанием и ещё раз после ответа шлюза, потому
   * что за это время в другой вкладке могли что-то купить. Покупка, которая к этому моменту
   * стала недопустимой, не сохраняется, и успех не показывается (`conflict`).
   */
  async pay(details: PaymentDetails): Promise<PayOutcome> {
    const state = this.stateSignal();
    if (this.mode === 'live' || state.step !== 'payment' || state.phase.kind === 'submitting') {
      return 'ignored';
    }
    this.repository.refresh();
    const check = checkTariffEligibility({
      request: state.request,
      tariffId: state.tariffId,
      catalog: this.catalog,
      purchases: this.repository.purchases(),
    });
    if (!check.ok) {
      this.stateSignal.set({
        step: 'tariffs',
        request: state.request,
        error: describeEligibilityFailure(check.failure),
      });
      return 'ineligible';
    }

    this.stateSignal.set({ ...state, phase: { kind: 'submitting' } });
    const result = await this.charge(check.tariff, details);

    if (result.status === 'declined') {
      this.stateSignal.set({ ...state, phase: { kind: 'declined', message: result.message } });
      return 'declined';
    }
    if (result.status === 'technical-error') {
      this.stateSignal.set({
        ...state,
        phase: { kind: 'error', message: TECHNICAL_ERROR_MESSAGE },
      });
      return 'error';
    }

    this.repository.refresh();
    const recheck = checkTariffEligibility({
      request: state.request,
      tariffId: check.tariff.id,
      catalog: this.catalog,
      purchases: this.repository.purchases(),
    });
    if (!recheck.ok) {
      return this.conflict(state.request, describeEligibilityFailure(recheck.failure));
    }

    const added = this.repository.add({
      id: result.transactionId,
      tariffId: check.tariff.id,
      productId: check.tariff.productId,
      purchasedAt: this.clock.now().toISOString(),
    });
    if (added.kind === 'duplicate') {
      return this.conflict(state.request, describeEligibilityFailure('already-owned'));
    }
    this.stateSignal.set({
      step: 'success',
      request: state.request,
      tariffId: check.tariff.id,
      persisted: added.persisted,
    });
    return 'approved';
  }

  close(): void {
    if (this.isSubmitting()) {
      return;
    }
    this.stateSignal.set({ step: 'closed' });
  }

  /** Возврат к тарифам с объяснением; покупка не сохраняется. */
  private conflict(request: CheckoutRequest, reason: string): PayOutcome {
    this.stateSignal.set({ step: 'tariffs', request, error: conflictMessage(reason) });
    return 'conflict';
  }

  private async charge(tariff: Tariff, details: PaymentDetails): Promise<PaymentResult> {
    try {
      return await this.gateway.charge({
        tariffId: tariff.id,
        amountCents: tariff.priceCents,
        cardNumber: details.cardNumber,
        email: details.email,
      });
    } catch {
      return { status: 'technical-error' };
    }
  }

  private candidateTariffs(request: CheckoutRequest): readonly Tariff[] {
    if (request.kind === 'product') {
      return this.catalog.tariffsOf(request.productId);
    }
    const granting = this.catalog.tariffsGranting(request.entitlement);
    const own = granting.filter((tariff) => tariff.productId === request.contextProductId);
    const others = granting.filter((tariff) => tariff.productId !== request.contextProductId);
    return [...own, ...others];
  }

  private selectionFor(tariffId: TariffId): CheckoutSelection | null {
    const tariff = this.catalog.tariff(tariffId);
    const product = tariff ? this.catalog.product(tariff.productId) : undefined;
    if (!tariff || !product) {
      return null;
    }
    return { tariff, product, priceLabel: describePrice(tariff) };
  }
}
