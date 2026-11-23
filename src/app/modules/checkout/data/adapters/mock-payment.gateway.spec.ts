import { TestBed } from '@angular/core/testing';
import { CHECKOUT_CONFIG } from '../../core/tokens/checkout-config.token';
import { MockPaymentGateway } from './mock-payment.gateway';

describe('MockPaymentGateway: демо-шлюз оплаты', () => {
  let gateway: MockPaymentGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockPaymentGateway,
        {
          provide: CHECKOUT_CONFIG,
          useValue: {
            mode: 'demo',
            officialCheckouts: {},
            processingDelayMs: 0,
            demoCards: [
              { number: '4242 4242 4242 4242', outcome: 'approved', label: 'успех' },
              { number: '4000 0000 0000 0002', outcome: 'declined', label: 'отказ' },
              { number: '4000 0000 0000 0119', outcome: 'technical-error', label: 'сбой' },
            ],
          },
        },
      ],
    });
    gateway = TestBed.inject(MockPaymentGateway);
  });

  const charge = (cardNumber: string): ReturnType<MockPaymentGateway['charge']> =>
    gateway.charge({ tariffId: 'tech-monthly', amountCents: 1490, cardNumber, email: 'a@b.co' });

  it('возвращает исход, настроенный для каждой тестовой карты', async () => {
    expect((await charge('4242 4242 4242 4242')).status).toBe('approved');
    expect((await charge('4000000000000002')).status).toBe('declined');
    expect((await charge('4000 0000 0000 0119')).status).toBe('technical-error');
  });

  it('отклоняет правдоподобную карту, которой нет среди настроенных тестовых', async () => {
    // 5555 5555 5555 4444 проходит проверку по алгоритму Луна, но отсутствует в демо-списке.
    const result = await charge('5555 5555 5555 4444');
    expect(result.status).toBe('declined');
    expect(result.status === 'declined' ? result.message : '').toContain('только тестовые карты');
  });
});
