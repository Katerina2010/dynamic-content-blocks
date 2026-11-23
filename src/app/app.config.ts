import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideCheckoutModule } from './modules/checkout/bootstrap/providers';
import { provideHomeModule } from './modules/home/bootstrap/providers';
import { provideProductsModule } from './modules/products/bootstrap/providers';
import { provideWebinarsModule } from './modules/webinars/bootstrap/providers';
import { BrowserLocalStorage } from './shared/storage/browser-local-storage';
import { KEY_VALUE_STORAGE } from './shared/storage/key-value-storage.token';
import { provideClock } from './shared/time/provide-clock';
import { environment } from '../environments/environment';

/**
 * Composition root: единственное место, которое знает все модули
 * и связывает порты с адаптерами.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClock(),
    { provide: KEY_VALUE_STORAGE, useClass: BrowserLocalStorage },
    provideProductsModule(),
    provideWebinarsModule(),
    provideCheckoutModule({ defaultMode: environment.checkoutMode }),
    provideHomeModule(),
  ],
};
