import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { formatUsd } from '../../../../../shared/format/format-usd';
import { CLOCK } from '../../../../../shared/time/clock.token';
import { CheckoutFacade } from '../../../core/facades/checkout.facade';
import { CardInputField, maskCardInput } from './card-input-mask';
import { cardNumberValidator, expiryValidator, testCardValidator } from './payment-validators';

@Component({
  selector: 'app-payment-step',
  imports: [ReactiveFormsModule],
  templateUrl: './payment-step.component.html',
  styleUrls: ['../step-styles.scss', './payment-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStepComponent {
  readonly titleId = input.required<string>();

  protected readonly facade = inject(CheckoutFacade);
  private readonly clock = inject(CLOCK);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    cardNumber: [
      '',
      [
        Validators.required,
        cardNumberValidator,
        testCardValidator(this.facade.demoCards.map((card) => card.number)),
      ],
    ],
    expiry: ['', [Validators.required, expiryValidator(() => this.clock.now())]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  /** Оплата доступна только для валидной формы, которая сейчас не отправляется. */
  protected readonly formValid = toSignal(
    this.form.statusChanges.pipe(map((status) => status === 'VALID')),
    { initialValue: this.form.valid },
  );
  protected readonly canPay = computed(() => this.formValid() && !this.facade.isSubmitting());

  protected readonly phase = computed(() => {
    const state = this.facade.state();
    return state.step === 'payment' ? state.phase : null;
  });

  protected readonly failureMessage = computed(() => {
    const phase = this.phase();
    return phase?.kind === 'declined' || phase?.kind === 'error' ? phase.message : null;
  });

  protected readonly submitLabel = computed(() => {
    const phase = this.phase();
    const selection = this.facade.selection();
    if (phase?.kind === 'submitting') {
      return 'Обрабатываем платёж…';
    }
    if (phase?.kind === 'declined' || phase?.kind === 'error') {
      return 'Повторить оплату';
    }
    return selection ? `Оплатить ${formatUsd(selection.tariff.priceCents)}` : 'Оплатить';
  });

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly cardInput = viewChild.required<ElementRef<HTMLInputElement>>('cardInput');
  private readonly injector = inject(Injector);

  constructor() {
    afterNextRender(() => {
      this.heading().nativeElement.focus();
    });
    // Во время оплаты fieldset недоступен, и фокус переходит на <body>. После отказа или
    // технической ошибки фокус возвращается на поле карты, когда форма снова доступна;
    // само сообщение озвучивается благодаря role="alert".
    effect(() => {
      if (this.failureMessage() === null) {
        return;
      }
      afterNextRender(
        () => {
          this.cardInput().nativeElement.focus();
        },
        { injector: this.injector },
      );
    });
  }

  protected showError(control: keyof typeof this.form.controls): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  /** Поддерживает маски полей карты при вводе, вставке и удалении в любом месте значения. */
  protected mask(event: Event, field: CardInputField): void {
    const element = event.target;
    if (!(element instanceof HTMLInputElement)) {
      return;
    }
    const inserting = !(event instanceof InputEvent) || event.inputType.startsWith('insert');
    const result = maskCardInput({
      field,
      value: element.value,
      caret: element.selectionStart ?? element.value.length,
      inserting,
    });
    element.value = result.value;
    element.setSelectionRange(result.caret, result.caret);
    this.form.controls[field].setValue(result.value, { emitModelToViewChange: false });
  }

  protected cardMessage(): string {
    return this.form.controls.cardNumber.hasError('unknownCard')
      ? 'Это не тестовая карта. Введите один из тестовых номеров выше'
      : 'Нужно 16 цифр номера карты';
  }

  protected expiryMessage(): string {
    return this.form.controls.expiry.hasError('expired')
      ? 'Срок действия карты истёк'
      : 'Укажите срок в формате ММ/ГГ, месяц от 01 до 12';
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    void this.facade.pay(this.form.getRawValue());
  }

  protected back(): void {
    this.facade.backToTariffs();
  }
}
