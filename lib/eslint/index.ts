import type { ConfigObject } from '@eslint/core';

import base from './base.ts';
import recommended from './recommended.ts';

const config: { recommended: ConfigObject; base: ConfigObject } = { recommended, base };
export default config;
