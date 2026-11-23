import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { homeCoreProviders } from './core.providers';
import { homeDataProviders } from './data.providers';

export function provideHomeModule(): EnvironmentProviders {
  return makeEnvironmentProviders([...homeDataProviders, ...homeCoreProviders]);
}
