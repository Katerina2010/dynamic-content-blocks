import { InjectionToken } from '@angular/core';
import { WebinarsRepository } from '../interfaces/webinars-repository.interface';

export const WEBINARS_REPOSITORY = new InjectionToken<WebinarsRepository>('WEBINARS_REPOSITORY');
