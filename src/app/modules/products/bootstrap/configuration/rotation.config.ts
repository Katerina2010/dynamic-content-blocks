import { RotationConfig } from '../../core/models/rotation-config.interface';

const ONE_MINUTE_MS = 60_000;

/**
 * Редакторская ротация: один продукт на календарный день по московскому времени,
 * в этом фиксированном порядке.
 */
export const ROTATION_CONFIG_VALUE: RotationConfig = {
  order: ['news', 'tech', 'invest', 'unlimited'],
  timeZone: 'Europe/Moscow',
  epochDay: '2026-01-01',
  refreshIntervalMs: ONE_MINUTE_MS,
};
