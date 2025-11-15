import type { ConfigObject } from '@eslint/core';
import js from '@eslint/js';

import baseConfig from './base.ts';

const recommended: ConfigObject = {
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
};

export default recommended;
