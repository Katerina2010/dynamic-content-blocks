import { describeRecording } from './describe-recording';

describe('describeRecording: подпись о записи вебинара', () => {
  const unpublished = {
    kind: 'included-with-entitlement',
    entitlement: 'tech.webinars',
    published: false,
  } as const;

  it('до и во время вебинара упоминает только анонс записи', () => {
    expect(describeRecording(unpublished, 'upcoming')).toBe('Запись анонсирована для подписчиков');
    expect(describeRecording(unpublished, 'started')).toBe('Запись анонсирована для подписчиков');
  });

  it('не обещает доступность записи после вебинара, пока публикация не подтверждена', () => {
    expect(describeRecording(unpublished, 'past')).toBe('Запись пока не опубликована');
    expect(describeRecording({ ...unpublished, published: true }, 'past')).toBe(
      'Запись доступна подписчикам',
    );
  });

  it('сообщает, когда запись не анонсирована', () => {
    expect(describeRecording({ kind: 'not-announced' }, 'past')).toBe('Запись не анонсирована');
  });
});
