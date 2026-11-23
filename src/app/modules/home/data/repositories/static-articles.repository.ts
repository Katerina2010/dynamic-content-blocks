import { Injectable } from '@angular/core';
import { ArticlesRepository } from '../../core/interfaces/articles-repository.interface';
import { Article } from '../../core/models/article.interface';
import { ARTICLES } from '../sources/articles.data';

@Injectable()
export class StaticArticlesRepository implements ArticlesRepository {
  private readonly byIdMap = new Map(ARTICLES.map((article) => [article.id, article]));

  byId(id: string): Article | undefined {
    return this.byIdMap.get(id);
  }
}
