import { Speaker, WebinarSeriesId } from './webinar.interface';
import { WebinarCta } from './webinar-cta.type';
import { WebinarStatus } from './webinar-status.type';

export interface WebinarCardView {
  readonly id: string;
  readonly title: string;
  /** Id серии, по нему UI выбирает стиль обложки. */
  readonly series: WebinarSeriesId;
  readonly seriesLabel: string;
  readonly dateLabel: string;
  readonly speakers: readonly Speaker[];
  readonly status: WebinarStatus;
  readonly statusLabel: string;
  readonly recordingNote: string | null;
  readonly cta: WebinarCta;
  readonly sourceUrl: string;
}
