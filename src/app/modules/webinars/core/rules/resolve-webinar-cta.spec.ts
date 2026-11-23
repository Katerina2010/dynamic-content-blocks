import { EntitlementId } from '../../../products/core/models/entitlement-id.type';
import { WEBINARS } from '../../data/sources/webinars.data';
import { Webinar } from '../models/webinar.interface';
import { resolveWebinarCta } from './resolve-webinar-cta';
import { resolveWebinarStatus } from './resolve-webinar-status';

const TECH = WEBINARS.find((webinar) => webinar.series === 'the-bell-tech')!;
const CHAT = WEBINARS.find((webinar) => webinar.series === 'the-chat')!;
const sellable = (): boolean => true;
const none = new Set<EntitlementId>();

describe('resolveWebinarCta: действие на карточке вебинара', () => {
  it('предлагает доступ к предстоящему вебинару, если права нет', () => {
    const cta = resolveWebinarCta({
      webinar: TECH,
      status: 'upcoming',
      owned: none,
      isSellable: sellable,
    });
    expect(cta).toEqual({
      kind: 'request-access',
      label: 'Получить доступ',
      entitlement: 'tech.webinars',
    });
  });

  it('не даёт доступ по праву другого продукта (например, Invest)', () => {
    const owned = new Set<EntitlementId>(['invest.webinars', 'tech.newsletter']);
    const cta = resolveWebinarCta({
      webinar: TECH,
      status: 'upcoming',
      owned,
      isSellable: sellable,
    });
    expect(cta.kind).toBe('request-access');
  });

  it('подтверждает участие, если право есть', () => {
    const owned = new Set<EntitlementId>(['tech.webinars']);
    const cta = resolveWebinarCta({
      webinar: TECH,
      status: 'upcoming',
      owned,
      isSellable: sellable,
    });
    expect(cta.kind).toBe('granted');
  });

  it('прекращает продажу доступа к эфиру после начала вебинара: время окончания не опубликовано', () => {
    const notOwned = resolveWebinarCta({
      webinar: TECH,
      status: 'started',
      owned: none,
      isSellable: sellable,
    });
    expect(notOwned).toEqual({
      kind: 'none',
      note: 'Эфир уже начался, время окончания не объявлено. Подробности — на странице события',
    });
    // Ни пути к покупке, ни обещания эфира, ни предложения записи, пока окончание неизвестно.
    expect(JSON.stringify(notOwned)).not.toMatch(/Получить|идёт|запись/i);

    const ownedCta = resolveWebinarCta({
      webinar: TECH,
      status: 'started',
      owned: new Set<EntitlementId>(['tech.webinars']),
      isSellable: sellable,
    });
    expect(ownedCta).toEqual({
      kind: 'granted',
      note: 'Участие входит в вашу подписку: ссылка на эфир — в письме The Bell',
    });
  });

  it('следует хронологии Tech-вебинара: до начала, в момент начала, поздно вечером, после полуночи', () => {
    const ctaAt = (instant: string): ReturnType<typeof resolveWebinarCta> =>
      resolveWebinarCta({
        webinar: TECH,
        status: resolveWebinarStatus(TECH.schedule, new Date(instant))!,
        owned: none,
        isSellable: sellable,
      });
    expect(ctaAt('2026-11-24T18:59:59+03:00')).toMatchObject({ kind: 'request-access' });
    expect(ctaAt('2026-11-24T19:00:00+03:00').kind).toBe('none');
    expect(ctaAt('2026-11-24T23:50:00+03:00').kind).toBe('none');
    expect(ctaAt('2026-11-25T00:00:30+03:00')).toEqual({ kind: 'none', note: 'Вебинар прошёл' });
  });

  it('не продаёт и не обещает запись, пока её публикация не подтверждена', () => {
    expect(TECH.recording).toMatchObject({ published: false });
    for (const owned of [none, new Set<EntitlementId>(['tech.webinars'])]) {
      const cta = resolveWebinarCta({ webinar: TECH, status: 'past', owned, isSellable: sellable });
      expect(cta).toEqual({ kind: 'none', note: 'Вебинар прошёл' });
    }
  });

  it('предлагает опубликованную запись прошедшего вебинара', () => {
    const published: Webinar = {
      ...TECH,
      recording: {
        kind: 'included-with-entitlement',
        entitlement: 'tech.webinars',
        published: true,
      },
    };
    expect(
      resolveWebinarCta({ webinar: published, status: 'past', owned: none, isSellable: sellable }),
    ).toMatchObject({ kind: 'request-access', label: 'Получить запись' });
    expect(
      resolveWebinarCta({
        webinar: published,
        status: 'past',
        owned: new Set<EntitlementId>(['tech.webinars']),
        isSellable: sellable,
      }),
    ).toEqual({ kind: 'granted', note: 'Запись входит в вашу подписку' });
  });

  it('сообщает только, что вебинар прошёл, если запись не анонсирована', () => {
    const unannounced: Webinar = { ...TECH, recording: { kind: 'not-announced' } };
    const cta = resolveWebinarCta({
      webinar: unannounced,
      status: 'past',
      owned: none,
      isSellable: sellable,
    });
    expect(cta).toEqual({ kind: 'none', note: 'Вебинар прошёл' });
  });

  it('не создаёт пути к покупке, если право не даёт ни один тариф', () => {
    const cta = resolveWebinarCta({
      webinar: TECH,
      status: 'upcoming',
      owned: none,
      isSellable: () => false,
    });
    expect(cta.kind).toBe('none');
  });

  it('ведёт на внешний сайт, если членство продаётся вне The Bell', () => {
    const cta = resolveWebinarCta({
      webinar: CHAT,
      status: 'upcoming',
      owned: none,
      isSellable: sellable,
    });
    expect(cta.kind).toBe('external');
  });
});
