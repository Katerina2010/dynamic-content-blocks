import { CheckoutConfig } from '../../core/models/checkout-config.interface';
import { OfficialCheckout } from '../../core/models/official-checkout.interface';
import { TariffId } from '../../../products/core/models/tariff-id.type';

const DEMO_PROCESSING_DELAY_MS = 1200;

/**
 * Явный allowlist официальных страниц оплаты The Bell, по одной на тариф. URL никогда
 * не собираются из идентификаторов. Каждая страница открыта 2026-11-23 без query-параметров:
 * продукт, период списания, USD, сумма и условия продления совпадают с тарифом, редиректа
 * не было (неизвестный id checkout перенаправляет на главную thebell.io). Платежей не было.
 *
 * Источники: subscription.thebell.io/tech, subscription.thebell.io/unlimited (только
 * USD-ссылки; рублёвая годовая ссылка не включена), thebell.io/invest (пробный тариф).
 * Остальные id найдены в отдельном исследовании и перепроверены на самих страницах.
 * Два id Invest, которые не являются 40-символьными hex-строками, сохранены в точности
 * как опубликованы.
 *
 * Цены скопированы так, как они напечатаны на странице оплаты. Страница пробного тарифа Tech
 * списывает $1,01, а страница продукта и наш каталог указывают $1: читателю показываются
 * обе суммы.
 *
 * Тип — полная запись по тарифам, поэтому тариф без официальной страницы — ошибка компиляции.
 */
export const OFFICIAL_CHECKOUTS: Readonly<Record<TariffId, OfficialCheckout>> = {
  'news-monthly': {
    url: 'https://thebell.io/checkout/3aabf776aac30ff2099e89ee092a6542ea2a38ee',
    priceOnCheckout: '$9,80/месяц',
  },
  'news-half-year': {
    url: 'https://thebell.io/checkout/ce648a5a31253d56e5081bd75d80a945481be9ee',
    priceOnCheckout: '$58,80/полгода',
  },
  'news-yearly': {
    url: 'https://thebell.io/checkout/ae3d45988f99cf8b5a7af196491be008295c824b',
    priceOnCheckout: '$107/год',
  },
  'tech-trial': {
    url: 'https://thebell.io/checkout/75b1e38437395f34c518010aecf59c9410d400f4',
    priceOnCheckout: '$1,01/месяц сейчас, затем $14,90/месяц',
    termsOnCheckout:
      'Пробный тариф: участие в вебинарах и полный архив материалов и вебинаров The Bell.Tech будут доступны со 2-го месяца подписки, когда она продлится по $14,90/месяц.',
  },
  'tech-monthly': {
    url: 'https://thebell.io/checkout/62a53293080185ee0749eb59c3c84ddbf5b704bf',
    priceOnCheckout: '$14,90/месяц',
  },
  'tech-yearly': {
    url: 'https://thebell.io/checkout/845617d9de8fa266cb2b1ce7813f35b9dc732dd1',
    priceOnCheckout: '$149/год',
  },
  'invest-trial': {
    url: 'https://thebell.io/checkout/7h6fe4e9e9195b2903372640046e01731d7fba',
    priceOnCheckout: '$1/месяц сейчас, затем $18,90/месяц',
    termsOnCheckout:
      'Пробный тариф: участие в вебинарах и полный архив материалов и вебинаров The Bell.Invest будут доступны со 2-го месяца подписки, когда она продлится по $18,90/месяц.',
  },
  'invest-monthly': {
    url: 'https://thebell.io/checkout/6h7fe4e9e9195b2903372640046e01731d7fbn',
    priceOnCheckout: '$18,90/месяц',
  },
  'invest-half-year': {
    url: 'https://thebell.io/checkout/1ae035b865c161bbf77044a325a44ba07b484704',
    priceOnCheckout: '$90/полгода',
  },
  'invest-yearly': {
    url: 'https://thebell.io/checkout/9ecc6e2623da8c1990a83d11b4afbd89fb5ed830',
    priceOnCheckout: '$180/год',
  },
  'unlimited-monthly': {
    url: 'https://thebell.io/checkout/c0977a668340c51cecc18e17e1e5a38477b189b6',
    priceOnCheckout: '$39/месяц',
  },
  'unlimited-half-year': {
    url: 'https://thebell.io/checkout/18935487d133a12c26d0aa983c60a69c95a40f5b',
    priceOnCheckout: '$219/полгода',
  },
  'unlimited-yearly': {
    url: 'https://thebell.io/checkout/bab2deb6efad5277e5e955ba2a02fdfc9bd77b1f',
    priceOnCheckout: '$399/год',
  },
};

/** Всё, кроме режима: он берётся из окружения и URL. */
export const CHECKOUT_SETTINGS: Omit<CheckoutConfig, 'mode'> = {
  officialCheckouts: OFFICIAL_CHECKOUTS,
  processingDelayMs: DEMO_PROCESSING_DELAY_MS,
  demoCards: [
    { number: '4242 4242 4242 4242', outcome: 'approved', label: 'успешная оплата' },
    { number: '4000 0000 0000 0002', outcome: 'declined', label: 'отказ банка' },
    { number: '4000 0000 0000 0119', outcome: 'technical-error', label: 'сбой платёжного сервиса' },
  ],
};
