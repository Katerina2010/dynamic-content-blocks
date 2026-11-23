import { Injectable } from '@angular/core';
import { WebinarsRepository } from '../../core/interfaces/webinars-repository.interface';
import { Webinar } from '../../core/models/webinar.interface';
import { WEBINARS } from '../sources/webinars.data';

@Injectable()
export class StaticWebinarsRepository implements WebinarsRepository {
  all(): readonly Webinar[] {
    return WEBINARS;
  }
}
