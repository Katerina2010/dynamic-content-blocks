import { Article } from '../models/article.interface';

export interface ArticlesRepository {
  byId(id: string): Article | undefined;
}
