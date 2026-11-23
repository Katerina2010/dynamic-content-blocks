import { Provider } from '@angular/core';
import { ARTICLES_REPOSITORY } from '../../core/tokens/articles-repository.token';
import { StaticArticlesRepository } from '../../data/repositories/static-articles.repository';

export const homeDataProviders: Provider[] = [
  { provide: ARTICLES_REPOSITORY, useClass: StaticArticlesRepository },
];
