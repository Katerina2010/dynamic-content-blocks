import { calendarDayInZone } from '../../../../shared/time/calendar-day';
import { parseIsoDay } from '../../../../shared/time/parse-iso-day';
import { WebinarSchedule } from '../models/webinar-schedule.type';
import { WebinarStatus } from '../models/webinar-status.type';

/**
 * Зона, календарный день которой ограничивает статус `started`. Длительность эфира
 * не опубликована, поэтому вместо выдуманного времени окончания статус остаётся `started`
 * до полуночи в этой зоне (та же граница суток, что и у ротации продуктов).
 */
export const STARTED_DAY_TIME_ZONE = 'Europe/Moscow';

/**
 * Статус относительно `now`. Возвращает `null`, если расписание не удаётся разобрать:
 * неразбираемый вебинар скрывается, чтобы не рисковать показом прошедшего события как
 * предстоящего. У вебинара `date-only` неизвестен момент начала, поэтому он никогда
 * не бывает `started`.
 */
export function resolveWebinarStatus(schedule: WebinarSchedule, now: Date): WebinarStatus | null {
  if (schedule.kind === 'datetime') {
    const startsAt = new Date(schedule.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return null;
    }
    if (now.getTime() < startsAt.getTime()) {
      return 'upcoming';
    }
    const sameDay =
      calendarDayInZone(now, STARTED_DAY_TIME_ZONE) ===
      calendarDayInZone(startsAt, STARTED_DAY_TIME_ZONE);
    return sameDay ? 'started' : 'past';
  }

  const day = parseIsoDay(schedule.date);
  if (day === null) {
    return null;
  }
  return calendarDayInZone(now, schedule.timeZone) <= day ? 'upcoming' : 'past';
}
