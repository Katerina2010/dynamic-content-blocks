import { resolveWebinarStatus } from './resolve-webinar-status';

describe('resolveWebinarStatus: статус вебинара по времени', () => {
  // 17:00 CET = 19:00 по Москве.
  const datetime = {
    kind: 'datetime',
    startsAt: '2026-11-24T17:00:00+01:00',
    label: '24 ноября',
  } as const;

  it('считается предстоящим до точного момента начала', () => {
    expect(resolveWebinarStatus(datetime, new Date('2026-11-24T15:59:59.999Z'))).toBe('upcoming');
  });

  it('считается начавшимся (а не прошедшим) с точного момента начала', () => {
    expect(resolveWebinarStatus(datetime, new Date('2026-11-24T16:00:00Z'))).toBe('started');
    expect(resolveWebinarStatus(datetime, new Date('2026-11-24T16:05:00Z'))).toBe('started');
  });

  it('остаётся начавшимся до полуночи по Москве, не предполагая длительность', () => {
    expect(resolveWebinarStatus(datetime, new Date('2026-11-24T23:59:59.999+03:00'))).toBe(
      'started',
    );
  });

  it('считается прошедшим со следующего календарного дня по Москве', () => {
    expect(resolveWebinarStatus(datetime, new Date('2026-11-25T00:00:00+03:00'))).toBe('past');
  });

  it('использует московские сутки, даже если начало поздно вечером по CET', () => {
    // 23:30 CET 24.11 — это 01:30 25.11 по Москве: вебинар начался в эти московские сутки.
    const late = { ...datetime, startsAt: '2026-11-24T23:30:00+01:00' } as const;
    expect(resolveWebinarStatus(late, new Date('2026-11-24T23:45:00+01:00'))).toBe('started');
    expect(resolveWebinarStatus(late, new Date('2026-11-26T00:00:00+03:00'))).toBe('past');
  });

  it('держит вебинар с известной только датой предстоящим до конца этого дня в его часовом поясе', () => {
    const dateOnly = {
      kind: 'date-only',
      date: '2026-12-03',
      timeZone: 'Europe/Moscow',
      label: '3 декабря',
    } as const;
    expect(resolveWebinarStatus(dateOnly, new Date('2026-12-03T23:59:59+03:00'))).toBe('upcoming');
    expect(resolveWebinarStatus(dateOnly, new Date('2026-12-04T00:00:00+03:00'))).toBe('past');
  });

  it('возвращает null для неразбираемого расписания, не пытаясь угадать', () => {
    expect(
      resolveWebinarStatus({ ...datetime, startsAt: 'soon' }, new Date('2026-11-22T00:00:00Z')),
    ).toBeNull();
  });
});
