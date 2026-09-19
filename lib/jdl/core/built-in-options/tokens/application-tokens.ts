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
import { KEYWORD, UNARY_OPTION } from '../../parsing/lexer/shared-tokens.ts';
import createTokenFromConfig from '../../parsing/lexer/token-creator.ts';
import type { JDLTokenConfig } from '../../types/parsing.ts';

const { OptionNames } = applicationOptions;

const {
  APPLICATION_TYPE,
  AUTHENTICATION_TYPE,
  BASE_NAME,
  BLUEPRINT,
  BLUEPRINTS,
  DTO_SUFFIX,
  ENTITY_SUFFIX,
  GATEWAY_SERVER_PORT,
  JHIPSTER_VERSION,
  JHI_PREFIX,
  JWT_SECRET_KEY,
  SERVER_PORT,
  SKIP_CLIENT,
  SKIP_SERVER,
  SKIP_USER_MANAGEMENT,
  TEST_FRAMEWORKS,
} = OptionNames;

export const applicationConfigCategoryToken = createTokenFromConfig({ name: 'CONFIG_KEY', pattern: Lexer.NA });

export const buildApplicationTokens = (tokenConfigs: JDLTokenConfig[]) => {
  const applicationConfigTokens: Pick<ITokenConfig, 'name' | 'pattern'>[] = [
    { name: 'BASE_NAME', pattern: BASE_NAME },
    { name: 'BLUEPRINTS', pattern: BLUEPRINTS },
    { name: 'BLUEPRINT', pattern: BLUEPRINT },
    { name: 'GATEWAY_SERVER_PORT', pattern: GATEWAY_SERVER_PORT },
    { name: 'AUTHENTICATION_TYPE', pattern: AUTHENTICATION_TYPE },
    { name: 'APPLICATION_TYPE', pattern: APPLICATION_TYPE },
    { name: 'TEST_FRAMEWORKS', pattern: TEST_FRAMEWORKS },
    { name: 'SERVER_PORT', pattern: SERVER_PORT },
    { name: 'JHI_PREFIX', pattern: JHI_PREFIX },
    { name: 'JWT_SECRET_KEY', pattern: JWT_SECRET_KEY },
    { name: 'JHIPSTER_VERSION', pattern: JHIPSTER_VERSION },
    { name: 'FRONT_END_BUILDER', pattern: 'frontendBuilder' }, // TODO always valid?
    { name: 'SKIP_USER_MANAGEMENT', pattern: SKIP_USER_MANAGEMENT },
    { name: 'ENTITY_SUFFIX', pattern: ENTITY_SUFFIX },
    { name: 'DTO_SUFFIX', pattern: DTO_SUFFIX },
    { name: 'SKIP_CLIENT', pattern: SKIP_CLIENT },
    { name: 'SKIP_SERVER', pattern: SKIP_SERVER },
    ...tokenConfigs,
  ];
  return {
    categoryToken: applicationConfigCategoryToken,
    tokens: [
      applicationConfigCategoryToken,
      ...applicationConfigTokens.map((tokenConfig: ITokenConfig) => {
        tokenConfig.categories = [applicationConfigCategoryToken];
        // This is actually needed as the skipClient & skipServer options are both entity & app options...
        if (['SKIP_CLIENT', 'SKIP_SERVER'].includes(tokenConfig.name)) {
          tokenConfig.categories.push(KEYWORD, UNARY_OPTION);
        }
        return createTokenFromConfig(tokenConfig);
      }),
    ],
  };
};
