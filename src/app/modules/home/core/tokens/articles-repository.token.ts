import { InjectionToken } from '@angular/core';
import { ArticlesRepository } from '../interfaces/articles-repository.interface';

export const ARTICLES_REPOSITORY = new InjectionToken<ArticlesRepository>('ARTICLES_REPOSITORY');
