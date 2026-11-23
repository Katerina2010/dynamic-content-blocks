import { Article } from '../../core/models/article.interface';

/**
 * Примеры заголовков с главной thebell.io на 2026-11-22 (только текст, без изображений).
 * Каждый `url` открыт 2026-11-23: HTTP 200 без редиректа, og:title совпадает с `title`,
 * дата публикации совпадает с `dateLabel`.
 */
export const ARTICLES: readonly Article[] = [
  {
    id: 'anthropic-1-4-trillion',
    rubric: 'Истории',
    title:
      'Компания на $1,4 трлн: как Anthropic хотела притормозить гонку ИИ, но вырвалась в ней вперед',
    dateLabel: '18 ноября 2026',
    url: 'https://thebell.io/kompaniya-na-14-trln-kak-anthropic-khotela-pritormozit-gonku-ii-no-vyrvalas-v-ney-vpered',
  },
  {
    id: 'kaliningrad-alert',
    rubric: 'Новости',
    title: 'В Калининграде впервые с начала войны объявили воздушную тревогу',
    dateLabel: '22 ноября 2026',
    url: 'https://thebell.io/v-kaliningrade-vpervye-s-nachala-voyny-obyavili-vozdushnuyu-trevogu',
  },
  {
    id: 'tech-weekly-ipo',
    rubric: 'The Bell.Tech',
    title:
      'Почему IPO Anthropic важно для всех, новая санкционная зачистка на российском технорынке и премьера GTA VI',
    dateLabel: '22 ноября 2026',
    url: 'https://thebell.io/pochemu-ipo-anthropic-vazhno-dlya-vsekh-novaya-sanktsionnaya-zachistka-na-rossiyskom-tekhnorynke-i-premera-gta-vi',
  },
  {
    id: 'gta-vi-first-day',
    rubric: 'Новости',
    title: 'GTA VI принесла $3,79 млрд в первый день продаж',
    dateLabel: '21 ноября 2026',
    url: 'https://thebell.io/gta-vi-prinesla-379-mlrd-v-pervyy-den-prodazh',
  },
  {
    id: 'wildberries-ceo',
    rubric: 'Новости',
    title: 'Татьяна Ким ушла с поста гендиректора Wildberries',
    dateLabel: '21 ноября 2026',
    url: 'https://thebell.io/tatyana-kim-ushla-s-posta-gendirektora-wildberries',
  },
  {
    id: 'bitcoin-low',
    rubric: 'Новости',
    title: 'Биткоин упал до двухлетнего минимума',
    dateLabel: '21 ноября 2026',
    url: 'https://thebell.io/bitkoin-upal-do-dvukhletnego-minimuma',
  },
  {
    id: 'week-summary-shenzhen',
    rubric: 'Итоги недели',
    title:
      'Почему саммит в Шэньчжэне не приблизил мир, Европа закрывается для россиян и что изменится для Anthropic после IPO',
    dateLabel: '20 ноября 2026',
    url: 'https://thebell.io/pochemu-sammit-v-shenchzhene-ne-priblizil-mir-evropa-zakryvaetsya-dlya-rossiyan-i-chto-izmenitsya-dlya-anthropic-posle-ipo',
  },
  {
    id: 'morning-budget',
    rubric: 'Утренняя рассылка',
    title:
      'Что спрятано в бюджетном пакете, Россия ответила на Крымский мост, Anthropic не спас ИИ-ралли',
    dateLabel: '20 ноября 2026',
    url: 'https://thebell.io/chto-spryatano-v-byudzhetnom-pakete-rossiya-otvetila-na-krymskiy-most-anthropic-ne-spas-ii-ralli',
  },
  {
    id: 'invest-megadeals',
    rubric: 'The Bell.Invest',
    title: 'Сейчас или никогда. Как заработать на волне мегасделок',
    dateLabel: '13 ноября 2026',
    url: 'https://thebell.io/seychas-ili-nikogda-kak-zarabotat-na-volne-megasdelok',
  },
  {
    id: 'crimean-bridge-arch',
    rubric: 'Новости',
    title:
      'Хуснуллин признал, что у Крымского моста повреждена арка. Сроков восстановления по-прежнему нет',
    dateLabel: '20 ноября 2026',
    url: 'https://thebell.io/khusnullin-priznal-chto-u-krymskogo-mosta-povrezhdena-arka-srokov-vosstanovleniya-po-prezhnemu-net',
  },
];
