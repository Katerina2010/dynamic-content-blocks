import { InjectionToken } from '@angular/core';
import { PurchaseRepository } from '../interfaces/purchase-repository.interface';

export const PURCHASE_REPOSITORY = new InjectionToken<PurchaseRepository>('PURCHASE_REPOSITORY');
