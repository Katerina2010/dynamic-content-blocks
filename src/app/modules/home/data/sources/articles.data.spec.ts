import { HOME_GRID } from '../../bootstrap/configuration/home-grid.config';
import { ARTICLES } from './articles.data';

describe('ARTICLES: статьи демонстрационной главной', () => {
  it('ведёт каждую статью на страницу thebell.io без query-параметров', () => {
    for (const article of ARTICLES) {
      expect(article.url).toMatch(/^https:\/\/thebell\.io\/[a-z0-9-]+$/);
    }
  });

  it('даёт отдельную ссылку каждой статье, использованной на главной', () => {
    const used = new Set(
      HOME_GRID.flatMap((item) => (item.kind === 'article' ? [item.articleId] : [])),
    );
    const urls = ARTICLES.filter((article) => used.has(article.id)).map((article) => article.url);
    expect(urls).toHaveLength(used.size);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
