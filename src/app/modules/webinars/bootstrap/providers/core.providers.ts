import { Provider } from '@angular/core';
import { WebinarsShowcaseFacade } from '../../core/facades/webinars-showcase.facade';
import { WEBINARS_REFRESH_INTERVAL_MS } from '../../core/tokens/webinars-refresh-interval.token';

const THIRTY_SECONDS_MS = 30_000;

export const webinarsCoreProviders: Provider[] = [
  { provide: WEBINARS_REFRESH_INTERVAL_MS, useValue: THIRTY_SECONDS_MS },
  WebinarsShowcaseFacade,
];
