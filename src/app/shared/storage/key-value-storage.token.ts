import { InjectionToken } from '@angular/core';
import { KeyValueStorage } from './key-value-storage.interface';

export const KEY_VALUE_STORAGE = new InjectionToken<KeyValueStorage>('KEY_VALUE_STORAGE');
