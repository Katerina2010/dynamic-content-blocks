import { EntitlementId } from '../../../products/core/models/entitlement-id.type';
import { Webinar } from '../models/webinar.interface';
import { WebinarCta } from '../models/webinar-cta.type';
import { WebinarStatus } from '../models/webinar-status.type';

export interface WebinarCtaParams {
  readonly webinar: Webinar;
  readonly status: WebinarStatus;
  readonly owned: ReadonlySet<EntitlementId>;
  /** True, если хотя бы один тариф каталога даёт это право. */
  readonly isSellable: (entitlement: EntitlementId) => boolean;
}

/**
 * Решает, что читатель может сделать с вебинаром.
 * Чистая функция: не обращается к каталогу, часам и хранилищу.
 */
export function resolveWebinarCta(params: WebinarCtaParams): WebinarCta {
  const { webinar, status, owned, isSellable } = params;
  const access = webinar.access;

  if (access.kind === 'external-membership') {
    return { kind: 'external', label: access.ctaLabel, url: access.url };
  }

  if (status === 'upcoming') {
    if (owned.has(access.entitlement)) {
      return { kind: 'granted', note: 'Доступ уже включён в вашу подписку' };
    }
    return isSellable(access.entitlement)
      ? { kind: 'request-access', label: 'Получить доступ', entitlement: access.entitlement }
      : { kind: 'none', note: 'Доступ к вебинару сейчас не продаётся' };
  }

  if (status === 'started') {
    // Ни длительность, ни время окончания не опубликованы, поэтому эфир мог уже закончиться:
    // доступ к нему здесь больше не продаётся и не обещается.
    // Рядом с этим пояснением остаётся официальная страница события.
    return owned.has(access.entitlement)
      ? {
          kind: 'granted',
          note: 'Участие входит в вашу подписку: ссылка на эфир — в письме The Bell',
        }
      : {
          kind: 'none',
          note: 'Эфир уже начался, время окончания не объявлено. Подробности — на странице события',
        };
  }

  const recording = webinar.recording;
  if (recording.kind === 'not-announced') {
    return { kind: 'none', note: 'Вебинар прошёл' };
  }
  if (!recording.published) {
    // Не продаётся и не обещается, пока запись не подтверждена как опубликованная.
    return { kind: 'none', note: 'Вебинар прошёл' };
  }
  if (owned.has(recording.entitlement)) {
    return { kind: 'granted', note: 'Запись входит в вашу подписку' };
  }
  return isSellable(recording.entitlement)
    ? { kind: 'request-access', label: 'Получить запись', entitlement: recording.entitlement }
    : { kind: 'none', note: 'Запись доступна только подписчикам' };
}
