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

import applicationOptions from '../../../../jhipster/application-options.ts';
import createTokenFromConfig from '../../parsing/lexer/token-creator.ts';
import type { JDLTokenConfig } from '../../types/parsing.ts';

const { OptionNames } = applicationOptions;

const { BLUEPRINT, BLUEPRINTS, JHIPSTER_VERSION } = OptionNames;

export const applicationConfigCategoryToken = createTokenFromConfig({ name: 'CONFIG_KEY', pattern: Lexer.NA });

export const buildApplicationTokens = (tokenConfigs: JDLTokenConfig[]) => {
  const applicationConfigTokens: Pick<ITokenConfig, 'name' | 'pattern'>[] = [
    { name: 'BLUEPRINTS', pattern: BLUEPRINTS },
    { name: 'BLUEPRINT', pattern: BLUEPRINT },
    // DEPRECATED: stamped by the generator, not a user option. TODO drop for v10.
    { name: 'JHIPSTER_VERSION', pattern: JHIPSTER_VERSION },
    ...tokenConfigs,
  ];
  return {
    categoryToken: applicationConfigCategoryToken,
    tokens: [
      applicationConfigCategoryToken,
      ...applicationConfigTokens.map((tokenConfig: ITokenConfig) => {
        const categories = [applicationConfigCategoryToken];
        // Copied rather than stamped onto the caller's config: the token configs come from a memoized application
        // definition that is shared by every runtime built from it.
        return createTokenFromConfig({ ...tokenConfig, categories });
      }),
    ],
  };
};
