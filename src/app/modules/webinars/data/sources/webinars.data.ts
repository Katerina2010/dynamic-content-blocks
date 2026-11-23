import { Webinar } from '../../core/models/webinar.interface';

const THE_CHAT_ACCESS = {
  kind: 'external-membership',
  membershipName: 'The Chat',
  url: 'https://the-chat.io/',
  ctaLabel: 'Как вступить в The Chat',
} as const;

/**
 * Проверено 2026-11-22.
 * - The Bell.Tech: webinar.thebell.io/webinar_tech_november2026 ("17:00 CET / 19:00 МСК").
 *   Доступ: платные тарифы The Bell.Tech и The Bell.Unlimited; пробный тариф за $1 исключён.
 *   Запись анонсирована как входящая в тариф ("Участие в вебинаре 24 ноября и запись"),
 *   но её публикация ещё не подтверждена: `published: false`, пока редактор её не подтвердит.
 * - The Chat: the-chat.io и страницы его событий. Записи нигде не упоминаются.
 *   Время опубликовано как "CET"; моменты ниже используют смещение, действующее на эту дату
 *   (CEST +02:00 до 25.10.2026, CET +01:00 после). У события 3 декабря на странице нет года;
 *   22.11.2026 оно указано как предстоящее, поэтому предполагается 2026 год.
 */
export const WEBINARS: readonly Webinar[] = [
  {
    id: 'tech-2026-11-24-dark-side-of-ai',
    title: 'На что способен AI и пора ли его замедлять?',
    series: 'the-bell-tech',
    seriesLabel: 'The Bell.Tech',
    schedule: {
      kind: 'datetime',
      startsAt: '2026-11-24T17:00:00+01:00',
      label: '24 ноября 2026, 17:00 CET / 19:00 МСК',
    },
    speakers: [
      { name: 'Дмитрий Волков', role: 'руководитель исследований Palisade Research' },
      { name: 'Михаил Ягудин', role: 'основатель «Самоцветов» и Arb Research' },
    ],
    access: { kind: 'entitlement', entitlement: 'tech.webinars', productId: 'tech' },
    recording: {
      kind: 'included-with-entitlement',
      entitlement: 'tech.webinars',
      published: false,
    },
    sourceUrl: 'https://webinar.thebell.io/webinar_tech_november2026',
  },
  {
    id: 'chat-2026-12-03-arkhipova',
    title: 'Великие антропологические открытия, изменившие мир',
    series: 'the-chat',
    seriesLabel: 'The Chat',
    schedule: {
      kind: 'datetime',
      startsAt: '2026-12-03T19:00:00+01:00',
      label: '3 декабря, 19:00 CET',
    },
    speakers: [{ name: 'Александра Архипова', role: 'социальный антрополог, фольклористка' }],
    access: THE_CHAT_ACCESS,
    recording: { kind: 'not-announced' },
    sourceUrl: 'https://the-chat.io/',
  },
  {
    id: 'chat-2026-11-18-peshkin',
    title: 'Как победить старение: какие ответы есть у науки и что мы можем сделать сами?',
    series: 'the-chat',
    seriesLabel: 'The Chat',
    schedule: {
      kind: 'datetime',
      startsAt: '2026-11-18T18:00:00+01:00',
      label: '18 ноября 2026, 18:00 CET',
    },
    speakers: [{ name: 'Леонид Пешкин', role: 'биолог, Гарвардский университет' }],
    access: THE_CHAT_ACCESS,
    recording: { kind: 'not-announced' },
    sourceUrl: 'https://chat.osetinskaya.io/peshkin',
  },
  {
    id: 'chat-2026-10-14-liberman',
    title: 'Будущее AI: мы создаем бога?',
    series: 'the-chat',
    seriesLabel: 'The Chat',
    schedule: {
      kind: 'datetime',
      startsAt: '2026-10-14T20:00:00+02:00',
      label: '14 октября 2026, 20:00 CET',
    },
    speakers: [{ name: 'Даниил и Давид Либерманы', role: 'предприниматели и инвесторы' }],
    access: THE_CHAT_ACCESS,
    recording: { kind: 'not-announced' },
    sourceUrl: 'https://chat.osetinskaya.io/live/libermans',
  },
  {
    id: 'chat-2026-09-14-dashevsky',
    title: 'Портфель инвестора в 2026–2027 годах',
    series: 'the-chat',
    seriesLabel: 'The Chat',
    schedule: {
      kind: 'datetime',
      startsAt: '2026-09-14T18:00:00+02:00',
      label: '14 сентября 2026, 18:00 CET',
    },
    speakers: [{ name: 'Стивен Дашевский', role: 'исполнительный директор D&P Advisors' }],
    access: THE_CHAT_ACCESS,
    recording: { kind: 'not-announced' },
    sourceUrl: 'https://chat.osetinskaya.io/live/dashevsky',
  },
];
