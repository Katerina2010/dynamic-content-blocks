import { InjectionToken } from '@angular/core';
import { Clock } from './clock.interface';

export const CLOCK = new InjectionToken<Clock>('CLOCK');
