import { BehaviorSubject, Observable } from 'rxjs';
import { Clock } from '../app/shared/time/clock.interface';

/** Часы для тестов, которыми управляют вручную. */
export class FakeClock implements Clock {
  private readonly current: BehaviorSubject<Date>;

  constructor(start: string) {
    this.current = new BehaviorSubject(new Date(start));
  }

  now(): Date {
    return this.current.value;
  }

  ticks(): Observable<Date> {
    return this.current.asObservable();
  }

  set(instant: string): void {
    this.current.next(new Date(instant));
  }
}
