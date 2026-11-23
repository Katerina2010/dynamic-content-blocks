import { WEBINARS } from '../../data/sources/webinars.data';
import { selectWebinars } from './select-webinars';

const NOW = new Date('2026-11-22T12:00:00+03:00');

describe('selectWebinars: подбор вебинаров для блока', () => {
  it('сначала показывает предстоящие вебинары (ближайшие первыми), затем самые недавние прошедшие', () => {
    const result = selectWebinars({
      webinars: WEBINARS,
      settings: { rule: 'upcoming-then-recent', limit: 4 },
      now: NOW,
    });
    expect(result.map((item) => [item.webinar.id, item.status])).toEqual([
      ['tech-2026-11-24-dark-side-of-ai', 'upcoming'],
      ['chat-2026-12-03-arkhipova', 'upcoming'],
      ['chat-2026-11-18-peshkin', 'past'],
      ['chat-2026-10-14-liberman', 'past'],
    ]);
  });

  it('пересчитывает статус с течением времени', () => {
    const result = selectWebinars({
      webinars: WEBINARS,
      settings: { rule: 'manual', webinarIds: ['tech-2026-11-24-dark-side-of-ai'] },
      now: new Date('2026-11-25T00:00:00+03:00'),
    });
    expect(result[0].status).toBe('past');
  });

  it('оставляет начавшийся сегодня вебинар первым — как начавшийся, а не прошедший', () => {
    const result = selectWebinars({
      webinars: WEBINARS,
      settings: { rule: 'upcoming-then-recent', limit: 3 },
      now: new Date('2026-11-24T19:05:00+03:00'),
    });
    expect(result.map((item) => [item.webinar.id, item.status])).toEqual([
      ['tech-2026-11-24-dark-side-of-ai', 'started'],
      ['chat-2026-12-03-arkhipova', 'upcoming'],
      ['chat-2026-11-18-peshkin', 'past'],
    ]);
  });

  it('фильтрует по серии и пропускает неизвестные id в ручном списке', () => {
    const bySeries = selectWebinars({
      webinars: WEBINARS,
      settings: { rule: 'upcoming-then-recent', limit: 10, series: ['the-bell-tech'] },
      now: NOW,
    });
    expect(bySeries).toHaveLength(1);

    const manual = selectWebinars({
      webinars: WEBINARS,
      settings: { rule: 'manual', webinarIds: ['missing', 'chat-2026-11-18-peshkin'] },
      now: NOW,
    });
    expect(manual.map((item) => item.webinar.id)).toEqual(['chat-2026-11-18-peshkin']);
  });
});
