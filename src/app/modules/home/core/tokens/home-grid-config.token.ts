import { InjectionToken } from '@angular/core';
import { GridItemConfig } from '../models/grid-item-config.type';

export const HOME_GRID_CONFIG = new InjectionToken<readonly GridItemConfig[]>('HOME_GRID_CONFIG');
