import { WebinarsShowcaseSettings } from '../models/webinars-showcase-settings.type';
import { Webinar } from '../models/webinar.interface';
import { WebinarStatus } from '../models/webinar-status.type';
import { resolveWebinarStatus } from './resolve-webinar-status';

export interface WebinarWithStatus {
  readonly webinar: Webinar;
  readonly status: WebinarStatus;
}

export interface SelectWebinarsParams {
  readonly webinars: readonly Webinar[];
  readonly settings: WebinarsShowcaseSettings;
  readonly now: Date;
}

function startKey(webinar: Webinar): string {
  return webinar.schedule.kind === 'datetime'
    ? new Date(webinar.schedule.startsAt).toISOString()
    : webinar.schedule.date;
}

function withStatus(webinars: readonly Webinar[], now: Date): WebinarWithStatus[] {
  return webinars.flatMap((webinar) => {
    const status = resolveWebinarStatus(webinar.schedule, now);
    return status ? [{ webinar, status }] : [];
  });
}

/** Применяет редакторское правило. Статус всегда вычисляется от `now` и никогда не хранится. */
export function selectWebinars(params: SelectWebinarsParams): readonly WebinarWithStatus[] {
  const { webinars, settings, now } = params;

  if (settings.rule === 'manual') {
    const byId = new Map(webinars.map((webinar) => [webinar.id, webinar]));
    const picked = settings.webinarIds.flatMap((id) => {
      const webinar = byId.get(id);
      return webinar ? [webinar] : [];
    });
    return withStatus(picked, now);
  }

  const filter = settings.series;
  const candidates = filter
    ? webinars.filter((webinar) => filter.includes(webinar.series))
    : webinars;
  const all = withStatus(candidates, now);
  // Начавшийся сегодня вебинар остаётся среди предстоящих: он самый актуальный.
  const upcoming = all
    .filter((item) => item.status !== 'past')
    .sort((a, b) => startKey(a.webinar).localeCompare(startKey(b.webinar)));
  const past = all
    .filter((item) => item.status === 'past')
    .sort((a, b) => startKey(b.webinar).localeCompare(startKey(a.webinar)));
  return [...upcoming, ...past].slice(0, Math.max(0, settings.limit));
}
