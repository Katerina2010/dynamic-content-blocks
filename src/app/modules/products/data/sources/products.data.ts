import { Product } from '../../core/models/product.interface';

/**
 * Проверено 2026-11-22 по публичным страницам, указанным в `sourceUrl`.
 * Описания — краткий пересказ официальных формулировок.
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'news',
    name: 'Новости и аналитика',
    tagline: 'Рассылки «Утро», «Вечер» и «Итоги недели»',
    description:
      'Утром — самое интересное из российских и мировых СМИ, вечером — разбор главного события дня, в пятницу — как новости недели складываются в большую картину.',
    mark: 'News',
    highlights: ['Две ежедневные рассылки по будням', '«Итоги недели» по пятницам'],
    tariffIds: ['news-monthly', 'news-half-year', 'news-yearly'],
    sourceUrl: 'https://thebell.io/paywall',
  },
  {
    id: 'tech',
    name: 'The Bell.Tech',
    tagline: 'О технологиях и IT‑компаниях в мире и в России',
    description:
      'Еженедельная рассылка о технологиях и их влиянии на бизнес и жизнь, архив из 400+ материалов и закрытые вебинары.',
    mark: 'Tech',
    highlights: ['Еженедельная рассылка', 'Архив 400+ материалов', 'Закрытые вебинары и их записи'],
    tariffIds: ['tech-trial', 'tech-monthly', 'tech-yearly'],
    sourceUrl: 'https://subscription.thebell.io/tech',
  },
  {
    id: 'invest',
    name: 'The Bell.Invest',
    tagline: 'Фондовый рынок глазами долгосрочного инвестора',
    description:
      'Разбор главных тем для инвесторов, большие инвестидеи и перспективы самых интересных компаний — без хайпа.',
    mark: 'Invest',
    highlights: ['Еженедельная рассылка', 'Полный архив материалов', 'Вебинары для подписчиков'],
    tariffIds: ['invest-trial', 'invest-monthly', 'invest-half-year', 'invest-yearly'],
    sourceUrl: 'https://thebell.io/invest',
  },
  {
    id: 'unlimited',
    name: 'The Bell.Unlimited',
    tagline: 'Весь контент The Bell с единой подпиской',
    description:
      'Новости и аналитика, The Bell.Invest и The Bell.Tech в одной подписке: все рассылки, все вебинары и весь архив на сайте.',
    mark: 'Unlimited',
    highlights: ['Пять рассылок', 'Все вебинары', 'Все материалы на сайте'],
    tariffIds: ['unlimited-monthly', 'unlimited-half-year', 'unlimited-yearly'],
    sourceUrl: 'https://subscription.thebell.io/unlimited',
  },
];
