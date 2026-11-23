import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { CheckoutFacade } from '../../../core/facades/checkout.facade';

@Component({
  selector: 'app-success-step',
  templateUrl: './success-step.component.html',
  styleUrls: ['../step-styles.scss', './success-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessStepComponent {
  readonly titleId = input.required<string>();
  /** False, когда покупка живёт только в памяти и пропадёт после перезагрузки. */
  readonly persisted = input.required<boolean>();

  protected readonly facade = inject(CheckoutFacade);
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    afterNextRender(() => {
      this.heading().nativeElement.focus();
    });
  }

  protected done(): void {
    this.facade.close();
  }
}
