import { EntitlementId } from '../../core/models/entitlement-id.type';
import { Tariff } from '../../core/models/tariff.interface';

const TECH_FULL: readonly EntitlementId[] = ['tech.newsletter', 'tech.archive', 'tech.webinars'];
const INVEST_FULL: readonly EntitlementId[] = [
  'invest.newsletter',
  'invest.archive',
  'invest.webinars',
];
const UNLIMITED: readonly EntitlementId[] = ['news.newsletters', ...TECH_FULL, ...INVEST_FULL];

const NEWS_FEATURES = ['Рассылки «Утро», «Вечер» и «Итоги недели»'];
const TECH_FEATURES = [
  'Еженедельная рассылка The Bell.Tech',
  'Полный архив 400+ материалов',
  'Все закрытые вебинары The Bell.Tech и их записи',
];
const INVEST_FEATURES = [
  'Все новые материалы и рассылки',
  'Полный архив материалов',
  'Неограниченный доступ к вебинарам',
];
const UNLIMITED_FEATURES = ['Все рассылки', 'Все вебинары', 'Все материалы на сайте'];

/**
 * USD-тарифы, проверенные 2026-11-22:
 * thebell.io/paywall, subscription.thebell.io/tech, thebell.io/invest, subscription.thebell.io/unlimited.
 * Пробные тарифы ограничены согласно опубликованным условиям (thebell.io/invest, FAQ на
 * webinar.thebell.io и обе официальные страницы оплаты пробных тарифов, перепроверено
 * 2026-11-23): вебинары и полный архив открываются только со 2-го месяца, когда подписка
 * продлевается по полной цене. Демо моделирует покупку пробного тарифа только как первый
 * месяц, поэтому пробный тариф здесь не даёт прав на вебинары и архив.
 */
export const TARIFFS: readonly Tariff[] = [
  {
    id: 'news-monthly',
    productId: 'news',
    title: 'Ежемесячный',
    kind: 'recurring',
    priceCents: 980,
    period: 'month',
    eligibility: 'anyone',
    grants: ['news.newsletters'],
    features: NEWS_FEATURES,
  },
  {
    id: 'news-half-year',
    productId: 'news',
    title: 'Полугодовой',
    kind: 'recurring',
    priceCents: 5880,
    period: 'half-year',
    eligibility: 'anyone',
    grants: ['news.newsletters'],
    features: NEWS_FEATURES,
  },
  {
    id: 'news-yearly',
    productId: 'news',
    title: 'Годовой',
    kind: 'recurring',
    priceCents: 10700,
    period: 'year',
    eligibility: 'anyone',
    grants: ['news.newsletters'],
    features: NEWS_FEATURES,
  },
  {
    id: 'tech-trial',
    productId: 'tech',
    title: 'Пробный',
    kind: 'trial',
    priceCents: 100,
    period: 'month',
    renewsInto: { priceCents: 1490, period: 'month' },
    eligibility: 'new-customers-of-product',
    grants: ['tech.newsletter'],
    features: [
      'Все новые выпуски The Bell.Tech',
      'Материалы раздела «Технологии» за последние 14 дней',
      'Вебинары и полный архив — со 2-го месяца, после перехода на $14,90/месяц',
    ],
  },
  {
    id: 'tech-monthly',
    productId: 'tech',
    title: 'Ежемесячный',
    kind: 'recurring',
    priceCents: 1490,
    period: 'month',
    eligibility: 'anyone',
    grants: TECH_FULL,
    features: TECH_FEATURES,
  },
  {
    id: 'tech-yearly',
    productId: 'tech',
    title: 'Годовой',
    kind: 'recurring',
    priceCents: 14900,
    period: 'year',
    eligibility: 'anyone',
    grants: TECH_FULL,
    features: TECH_FEATURES,
  },
  {
    id: 'invest-trial',
    productId: 'invest',
    title: 'Пробный',
    kind: 'trial',
    priceCents: 100,
    period: 'month',
    renewsInto: { priceCents: 1890, period: 'month' },
    eligibility: 'new-customers-of-product',
    grants: ['invest.newsletter'],
    features: [
      'Четыре рассылки The Bell.Invest',
      'Вебинары и полный архив — со 2-го месяца, после перехода на $18,90/месяц',
    ],
  },
  {
    id: 'invest-monthly',
    productId: 'invest',
    title: 'Ежемесячный',
    kind: 'recurring',
    priceCents: 1890,
    period: 'month',
    eligibility: 'anyone',
    grants: INVEST_FULL,
    features: INVEST_FEATURES,
  },
  {
    id: 'invest-half-year',
    productId: 'invest',
    title: 'Полугодовой',
    kind: 'recurring',
    priceCents: 9000,
    period: 'half-year',
    eligibility: 'anyone',
    grants: INVEST_FULL,
    features: INVEST_FEATURES,
  },
  {
    id: 'invest-yearly',
    productId: 'invest',
    title: 'Годовой',
    kind: 'recurring',
    priceCents: 18000,
    period: 'year',
    eligibility: 'anyone',
    grants: INVEST_FULL,
    features: INVEST_FEATURES,
  },
  {
    id: 'unlimited-monthly',
    productId: 'unlimited',
    title: 'Ежемесячный',
    kind: 'recurring',
    priceCents: 3900,
    period: 'month',
    eligibility: 'anyone',
    grants: UNLIMITED,
    features: UNLIMITED_FEATURES,
  },
  {
    id: 'unlimited-half-year',
    productId: 'unlimited',
    title: 'Полугодовой',
    kind: 'recurring',
    priceCents: 21900,
    period: 'half-year',
    eligibility: 'anyone',
    grants: UNLIMITED,
    features: UNLIMITED_FEATURES,
  },
  {
    id: 'unlimited-yearly',
    productId: 'unlimited',
    title: 'Годовой',
    kind: 'recurring',
    priceCents: 39900,
    period: 'year',
    eligibility: 'anyone',
    grants: UNLIMITED,
    features: UNLIMITED_FEATURES,
  },
];
