import { Injectable } from '@angular/core';
import { EMPTY, Observable, filter, fromEvent, map } from 'rxjs';
import { KeyValueStorage } from './key-value-storage.interface';

function localStorageOrNull(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

/**
 * Адаптер `window.localStorage`. Приватный режим, превышение квоты и отключённое хранилище
 * сводятся к неудачному результату операции.
 */
@Injectable()
export class BrowserLocalStorage implements KeyValueStorage {
  read(key: string): string | null {
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  write(key: string, value: string): boolean {
    try {
      globalThis.localStorage.setItem(key, value);
      return globalThis.localStorage.getItem(key) === value;
    } catch {
      return false;
    }
  }

  /** Событие `storage`: приходит только в другие вкладки; `key === null` означает `clear()`. */
  externalChanges(key: string): Observable<void> {
    const storage = localStorageOrNull();
    if (storage === null || typeof globalThis.addEventListener !== 'function') {
      return EMPTY;
    }
    return fromEvent<StorageEvent>(globalThis, 'storage').pipe(
      filter((event) => event.storageArea === storage && (event.key === key || event.key === null)),
      map(() => undefined),
    );
  }
}
