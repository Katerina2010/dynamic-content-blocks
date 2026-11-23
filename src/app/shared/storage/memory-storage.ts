import { Observable, Subject, filter, map } from 'rxjs';
import { KeyValueStorage } from './key-value-storage.interface';

/**
 * Хранилище в памяти для тестов; `failWrites` имитирует недоступное хранилище.
 * `writeFromAnotherTab` / `removeFromAnotherTab` меняют значение и уведомляют подписчиков,
 * как это делает событие браузера `storage` в других вкладках.
 */
export class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();
  private readonly changes = new Subject<string>();

  constructor(private readonly options: { failWrites: boolean } = { failWrites: false }) {}

  read(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  write(key: string, value: string): boolean {
    if (this.options.failWrites) {
      return false;
    }
    this.values.set(key, value);
    return true;
  }

  externalChanges(key: string): Observable<void> {
    return this.changes.pipe(
      filter((changed) => changed === key),
      map(() => undefined),
    );
  }

  writeFromAnotherTab(key: string, value: string): void {
    this.values.set(key, value);
    this.changes.next(key);
  }

  removeFromAnotherTab(key: string): void {
    this.values.delete(key);
    this.changes.next(key);
  }
}
