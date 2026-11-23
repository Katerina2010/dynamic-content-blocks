import { RecordingPolicy } from '../models/recording-policy.type';
import { WebinarStatus } from '../models/webinar-status.type';

/** Никогда не обещает доступность, пока запись не подтверждена как опубликованная. */
export function describeRecording(recording: RecordingPolicy, status: WebinarStatus): string {
  if (recording.kind === 'not-announced') {
    return 'Запись не анонсирована';
  }
  if (status !== 'past') {
    return 'Запись анонсирована для подписчиков';
  }
  return recording.published ? 'Запись доступна подписчикам' : 'Запись пока не опубликована';
}
