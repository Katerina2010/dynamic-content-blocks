import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalShellComponent } from '../../../../shared/ui/modal-shell/modal-shell.component';
import { CheckoutFacade } from '../../core/facades/checkout.facade';
import { PaymentStepComponent } from '../components/payment-step/payment-step.component';
import { RedirectStepComponent } from '../components/redirect-step/redirect-step.component';
import { SuccessStepComponent } from '../components/success-step/success-step.component';
import { TariffStepComponent } from '../components/tariff-step/tariff-step.component';

/**
 * Отображает модальное окно checkout для текущего шага фасада.
 * Подключается один раз в корне приложения.
 */
@Component({
  selector: 'app-checkout-host',
  imports: [
    ModalShellComponent,
    TariffStepComponent,
    PaymentStepComponent,
    RedirectStepComponent,
    SuccessStepComponent,
  ],
  templateUrl: './checkout-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutHostComponent {
  protected readonly facade = inject(CheckoutFacade);
  protected readonly titleId = 'checkout-dialog-title';

  protected close(): void {
    this.facade.close();
  }
}
