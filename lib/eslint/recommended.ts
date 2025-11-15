import js from '@eslint/js';
import type { Config } from 'eslint/config';

import baseConfig from './base.ts';

const recommended = {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    'import/parsers': {
      espree: ['.js', '.cjs', '.mjs', '.jsx'],
    },
    'import/resolver': {
      node: true,
    },
  },
  ...baseConfig,
  rules: {
    ...js.configs.recommended.rules,
    ...baseConfig.rules,
  },
} as const satisfies Config;

export default recommended;
