import { InjectionToken } from '@angular/core';
import { EntitlementQuery } from '../interfaces/entitlement-query.interface';

export const ENTITLEMENT_QUERY = new InjectionToken<EntitlementQuery>('ENTITLEMENT_QUERY');
