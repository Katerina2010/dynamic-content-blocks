import { Provider } from '@angular/core';
import { HomeGridFacade } from '../../core/facades/home-grid.facade';
import { HOME_GRID_CONFIG } from '../../core/tokens/home-grid-config.token';
import { HOME_GRID } from '../configuration/home-grid.config';

export const homeCoreProviders: Provider[] = [
  { provide: HOME_GRID_CONFIG, useValue: HOME_GRID },
  HomeGridFacade,
];
