/** Архитектурные границы проекта dynamic-content-blocks. */
const MOD = '^src/app/modules/([^/]+)/';
module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'shared-is-leaf',
      comment: 'shared не должен импортировать функциональные модули',
      severity: 'error',
      from: { path: '^src/app/shared/' },
      to: { path: '^src/app/modules/' },
    },
    {
      name: 'core-no-data',
      comment: 'core зависит только от контрактов и никогда — от реализаций в data',
      severity: 'error',
      from: { path: MOD + 'core/' },
      to: { path: '^src/app/modules/[^/]+/(data|ui|bootstrap)/' },
    },
    {
      name: 'data-no-ui',
      severity: 'error',
      from: { path: MOD + 'data/' },
      to: { path: '^src/app/modules/[^/]+/ui/' },
    },
    {
      name: 'ui-no-data',
      comment: 'UI обращается только к фасадам',
      severity: 'error',
      from: { path: MOD + 'ui/' },
      to: { path: '^src/app/modules/[^/]+/data/' },
    },
    {
      name: 'products-is-base-module',
      comment: 'products владеет коммерческими портами и не должен импортировать другие функциональные модули',
      severity: 'error',
      from: { path: '^src/app/modules/products/' },
      to: { path: '^src/app/modules/(home|webinars|checkout)/' },
    },
    {
      name: 'nobody-imports-checkout',
      comment: 'к checkout обращаются через порт SUBSCRIPTION_CHECKOUT; импортирует его только composition root',
      severity: 'error',
      from: { path: '^src/app/modules/(?!checkout/)' },
      to: { path: '^src/app/modules/checkout/' },
    },
    {
      name: 'nobody-imports-home',
      severity: 'error',
      from: { path: '^src/app/modules/(?!home/)' },
      to: { path: '^src/app/modules/home/' },
    },
    {
      name: 'webinars-only-from-home',
      severity: 'error',
      from: { path: '^src/app/modules/(products|checkout)/' },
      to: { path: '^src/app/modules/webinars/' },
    },
    {
      name: 'cross-module-only-via-public-layers',
      comment: 'другие модули могут использовать core/ui/bootstrap модуля products, но никогда — его слой data',
      severity: 'error',
      from: { path: '^src/app/modules/(?!products/)' },
      to: { path: '^src/app/modules/products/data/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.spec\\.ts$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.app.json' },
  },
};
