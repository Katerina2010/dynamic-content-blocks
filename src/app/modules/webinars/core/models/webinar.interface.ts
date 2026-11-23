import { RecordingPolicy } from './recording-policy.type';
import { WebinarAccess } from './webinar-access.type';
import { WebinarSchedule } from './webinar-schedule.type';

export type WebinarSeriesId = 'the-bell-tech' | 'the-chat';

export interface Speaker {
  readonly name: string;
  readonly role: string;
}

export interface Webinar {
  readonly id: string;
  readonly title: string;
  readonly series: WebinarSeriesId;
  /** Подпись продукта или серии на карточке, например "The Bell.Tech". */
  readonly seriesLabel: string;
  readonly schedule: WebinarSchedule;
  readonly speakers: readonly Speaker[];
  readonly access: WebinarAccess;
  readonly recording: RecordingPolicy;
  readonly sourceUrl: string;
}
