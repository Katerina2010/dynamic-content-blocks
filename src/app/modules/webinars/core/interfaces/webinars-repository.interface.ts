import { Webinar } from '../models/webinar.interface';

export interface WebinarsRepository {
  all(): readonly Webinar[];
}
