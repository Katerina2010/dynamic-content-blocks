import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FakeClock } from '../../../../../../testing/fake-clock';
import { CLOCK } from '../../../../../shared/time/clock.token';
import { CheckoutFacade } from '../../../core/facades/checkout.facade';
import { CheckoutState } from '../../../core/models/checkout-state.type';
import { PaymentStepComponent } from './payment-step.component';

/** Только то, что шаг оплаты читает из фасада. */
function facadeStub(): Record<string, unknown> {
  const state = signal<CheckoutState>({
    step: 'payment',
    request: { kind: 'product', productId: 'tech' },
    tariffId: 'tech-monthly',
    phase: { kind: 'idle' },
  });
  return {
    state,
    isSubmitting: computed(() => {
      const current = state();
      return current.step === 'payment' && current.phase.kind === 'submitting';
    }),
    selection: signal(null),
    demoCards: [{ number: '4242 4242 4242 4242', outcome: 'approved', label: 'успех' }],
    pay: () => Promise.resolve('approved'),
    backToTariffs: () => undefined,
  };
}

describe('PaymentStepComponent: кнопка оплаты', () => {
  let fixture: ComponentFixture<PaymentStepComponent>;
  let facade: Record<string, unknown>;

  const root = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const payButton = (): HTMLButtonElement | null =>
    root().querySelector<HTMLButtonElement>('button[type="submit"]');

  async function type(id: string, value: string): Promise<void> {
    const input = root().querySelector<HTMLInputElement>(`#${id}`);
    if (!input) {
      throw new Error(`No input #${id}`);
    }
    input.value = value;
    if (input.type !== 'email') {
      input.setSelectionRange(value.length, value.length);
    }
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function fillValid(): Promise<void> {
    await type('pay-email', 'demo@example.com');
    await type('pay-card', '4242424242424242');
    await type('pay-expiry', '1228');
    await type('pay-cvc', '123');
  }

  beforeEach(async () => {
    facade = facadeStub();
    TestBed.configureTestingModule({
      providers: [
        { provide: CheckoutFacade, useValue: facade },
        { provide: CLOCK, useValue: new FakeClock('2026-11-23T12:00:00+03:00') },
      ],
    });
    fixture = TestBed.createComponent(PaymentStepComponent);
    fixture.componentRef.setInput('titleId', 'title');
    await fixture.whenStable();
  });

  it('недоступна для пустой формы и объясняет почему', () => {
    expect(payButton()?.disabled).toBe(true);
    expect(root().querySelector('#pay-submit-hint')?.textContent).toContain('все поля');
  });

  it('остаётся недоступной для неизвестной карты и показывает ошибку поля после ухода с него', async () => {
    await fillValid();
    await type('pay-card', '5555555555554444');
    expect(payButton()?.disabled).toBe(true);
    expect(root().querySelector('#pay-card-error')?.textContent).toContain('не тестовая карта');
  });

  /** Каждый id, указанный в aria-describedby, должен существовать в отрисованном шаге. */
  function danglingDescriptions(): string[] {
    return [...root().querySelectorAll('[aria-describedby]')].flatMap((element) =>
      (element.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((id) => id !== '' && root().querySelector(`#${id}`) === null),
    );
  }

  it('ссылается в описаниях полей только на существующие элементы — до и после ошибок', async () => {
    expect(danglingDescriptions()).toEqual([]);
    expect(root().querySelector('#pay-card')?.getAttribute('aria-describedby')).toBe(
      'pay-card-hint',
    );
    expect(root().querySelector('#pay-email')?.hasAttribute('aria-describedby')).toBe(false);

    await type('pay-email', 'bad@');
    await type('pay-card', '1234');
    await type('pay-expiry', '13');
    await type('pay-cvc', '1');
    expect(danglingDescriptions()).toEqual([]);
    expect(root().querySelector('#pay-email')?.getAttribute('aria-describedby')).toBe(
      'pay-email-error',
    );
    expect(root().querySelector('#pay-card')?.getAttribute('aria-describedby')).toBe(
      'pay-card-hint pay-card-error',
    );
    expect(root().querySelector('#pay-cvc')?.getAttribute('aria-invalid')).toBe('true');

    await fillValid();
    expect(danglingDescriptions()).toEqual([]);
    expect(root().querySelector('#pay-cvc')?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('становится доступной, когда все поля заполнены верно', async () => {
    await fillValid();
    expect(payButton()?.disabled).toBe(false);
    expect(root().querySelector('#pay-submit-hint')).toBeNull();
  });

  it('недоступна во время отправки платежа', async () => {
    await fillValid();
    const state = facade['state'] as ReturnType<typeof signal<CheckoutState>>;
    state.set({
      step: 'payment',
      request: { kind: 'product', productId: 'tech' },
      tariffId: 'tech-monthly',
      phase: { kind: 'submitting' },
    });
    await fixture.whenStable();
    expect(payButton()?.disabled).toBe(true);
    expect(payButton()?.getAttribute('aria-busy')).toBe('true');
  });

  describe('фокус после неудачной оплаты', () => {
    beforeEach(() => {
      document.body.appendChild(root());
    });

    afterEach(() => {
      root().remove();
    });

    async function submitThenFail(phase: CheckoutState): Promise<void> {
      await fillValid();
      payButton()?.focus();
      const state = facade['state'] as ReturnType<typeof signal<CheckoutState>>;
      state.set({
        step: 'payment',
        request: { kind: 'product', productId: 'tech' },
        tariffId: 'tech-monthly',
        phase: { kind: 'submitting' },
      });
      await fixture.whenStable();
      // Fieldset и кнопка теперь недоступны: браузер сбрасывает фокус на <body>.
      (document.activeElement as HTMLElement | null)?.blur();
      state.set(phase);
      await fixture.whenStable();
    }

    for (const phase of [
      { kind: 'declined', message: 'Банк отклонил платёж.' },
      { kind: 'error', message: 'Платёжный сервис не ответил.' },
    ] as const) {
      it(`возвращает фокус на доступное поле карты после "${phase.kind}"`, async () => {
        await submitThenFail({
          step: 'payment',
          request: { kind: 'product', productId: 'tech' },
          tariffId: 'tech-monthly',
          phase,
        });
        const card = root().querySelector<HTMLInputElement>('#pay-card');
        expect(card?.disabled).toBe(false);
        expect(document.activeElement).toBe(card);
        expect(document.activeElement).not.toBe(document.body);
        expect(root().querySelector('[role="alert"]')?.textContent).toContain(phase.message);
      });
    }
  });
});
