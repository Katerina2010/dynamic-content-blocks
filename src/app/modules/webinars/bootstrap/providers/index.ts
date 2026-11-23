import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { webinarsCoreProviders } from './core.providers';
import { webinarsDataProviders } from './data.providers';

export function provideWebinarsModule(): EnvironmentProviders {
  return makeEnvironmentProviders([...webinarsDataProviders, ...webinarsCoreProviders]);
}
