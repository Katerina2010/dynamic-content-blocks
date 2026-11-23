import { Provider } from '@angular/core';
import { WEBINARS_REPOSITORY } from '../../core/tokens/webinars-repository.token';
import { StaticWebinarsRepository } from '../../data/repositories/static-webinars.repository';

export const webinarsDataProviders: Provider[] = [
  { provide: WEBINARS_REPOSITORY, useClass: StaticWebinarsRepository },
];
