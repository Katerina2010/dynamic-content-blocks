import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { CheckoutFacade } from '../../../core/facades/checkout.facade';

/**
 * Режим Live: передаёт читателя на официальный checkout The Bell для выбранного тарифа.
 * Нет ни формы карты, ни экрана успеха: это приложение не может подтвердить оплату.
 */
@Component({
  selector: 'app-redirect-step',
  templateUrl: './redirect-step.component.html',
  styleUrls: ['../step-styles.scss', './redirect-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedirectStepComponent {
  readonly titleId = input.required<string>();

  protected readonly facade = inject(CheckoutFacade);
  protected readonly checkout = computed(() => {
    const state = this.facade.state();
    return state.step === 'redirect' ? state.checkout : null;
  });

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    afterNextRender(() => {
      this.heading().nativeElement.focus();
    });
  }

  protected back(): void {
    this.facade.backToTariffs();
  }
}
