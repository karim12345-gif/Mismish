const DEFAULT_LIMIT = 50;

export const limitFrom = (value?: string): number =>
  Math.min(Math.max(Number(value) || DEFAULT_LIMIT, 1), 100);
