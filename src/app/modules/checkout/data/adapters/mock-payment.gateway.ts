import { Injectable, inject } from '@angular/core';
import { PaymentGateway } from '../../core/interfaces/payment-gateway.interface';
import { ChargeRequest } from '../../core/models/charge-request.interface';
import { PaymentResult } from '../../core/models/payment-result.type';
import { CHECKOUT_CONFIG } from '../../core/tokens/checkout-config.token';

const DECLINE_MESSAGE = 'Банк отклонил платёж. Проверьте данные карты или используйте другую.';
const UNKNOWN_CARD_MESSAGE =
  'Эта карта не из списка тестовых. В демо принимаются только тестовые карты — не вводите данные настоящей карты.';

/**
 * ТОЛЬКО ДЛЯ ДЕМО. Никогда не списывает деньги и не хранит данные карты. Исход выбирается
 * по номеру настроенной тестовой карты; любая ненастроенная карта отклоняется.
 */
@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  private readonly config = inject(CHECKOUT_CONFIG);
  private sequence = 0;

  async charge(request: ChargeRequest): Promise<PaymentResult> {
    await new Promise<void>((resolve) => setTimeout(resolve, this.config.processingDelayMs));

    const digits = request.cardNumber.replace(/\D/g, '');
    const outcome = this.config.demoCards.find(
      (card) => card.number.replace(/\D/g, '') === digits,
    )?.outcome;

    if (outcome === undefined) {
      return { status: 'declined', message: UNKNOWN_CARD_MESSAGE };
    }
    if (outcome === 'declined') {
      return { status: 'declined', message: DECLINE_MESSAGE };
    }
    if (outcome === 'technical-error') {
      return { status: 'technical-error' };
    }
    this.sequence += 1;
    return {
      status: 'approved',
      transactionId: `demo-${request.tariffId}-${Date.now()}-${this.sequence}`,
    };
  }
}
