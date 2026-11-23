import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CheckoutFacade } from '../../../core/facades/checkout.facade';

@Component({
  selector: 'app-tariff-step',
  templateUrl: './tariff-step.component.html',
  styleUrls: ['../step-styles.scss', './tariff-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TariffStepComponent {
  readonly titleId = input.required<string>();

  protected readonly facade = inject(CheckoutFacade);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly showSelectionHint = signal(false);
  protected readonly error = computed(() => {
    const state = this.facade.state();
    return state.step === 'tariffs' ? state.error : null;
  });
  protected readonly showProductNames = computed(
    () => new Set(this.facade.options().map((option) => option.product.id)).size > 1,
  );

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    afterNextRender(() => {
      this.heading().nativeElement.focus();
    });
  }

  protected select(tariffId: string): void {
    this.selectedId.set(tariffId);
    this.showSelectionHint.set(false);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const tariffId = this.selectedId();
    if (tariffId === null) {
      this.showSelectionHint.set(true);
      return;
    }
    this.facade.chooseTariff(tariffId);
  }

  protected close(): void {
    this.facade.close();
  }
}
