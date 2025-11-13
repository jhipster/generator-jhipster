import { kebabCase } from 'lodash-es';

export const convertToCliArgs = (opts: Record<string, string>): string => {
  return Object.entries(opts)
    .map(([key, value]) => {
      key = kebabCase(key);
      if (typeof value === 'boolean') {
        return `--${value ? '' : 'no-'}${key}`;
      }
      return `--${key} ${value}`;
    })
    .join(' ');
};
