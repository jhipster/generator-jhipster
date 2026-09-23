/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type ITokenConfig, Lexer } from 'chevrotain';

import createTokenFromConfig from '../../parsing/lexer/token-creator.ts';
import type { JDLTokenConfig } from '../../types/parsing.ts';

export const applicationConfigCategoryToken = createTokenFromConfig({ name: 'CONFIG_KEY', pattern: Lexer.NA });

/**
 * The application config tokens from the token configs of the application JDL definitions, which come from the
 * generators' commands: no application option is built in any more.
 */
export const buildApplicationTokens = (tokenConfigs: JDLTokenConfig[]) => {
  return {
    categoryToken: applicationConfigCategoryToken,
    tokens: [
      applicationConfigCategoryToken,
      ...tokenConfigs.map((tokenConfig: ITokenConfig) => {
        const categories = [applicationConfigCategoryToken];
        // Copied rather than stamped onto the caller's config: the token configs come from a memoized application
        // definition that is shared by every runtime built from it.
        return createTokenFromConfig({ ...tokenConfig, categories });
      }),
    ],
  };
};
