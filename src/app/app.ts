import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CheckoutHostComponent } from './modules/checkout/ui/checkout-host/checkout-host.component';
import { HomePageComponent } from './modules/home/ui/home-page/home-page.component';

@Component({
  selector: 'app-root',
  imports: [HomePageComponent, CheckoutHostComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
