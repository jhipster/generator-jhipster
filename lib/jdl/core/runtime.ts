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

import type { Lexer, TokenType } from 'chevrotain';

import { getDefaultJDLApplicationConfig, getDefaultJDLDeploymentConfig } from '../../jdl-config/jhipster-jdl-config.ts';

import JDLApplicationDefinition from './built-in-options/jdl-application-definition.ts';
import { buildApplicationTokens } from './built-in-options/tokens/application-tokens.ts';
import { buildDeploymentTokens } from './built-in-options/tokens/deployment-tokens.ts';
import JDLParser from './parsing/jdl-parser.ts';
import { type JDLTokens, allTokens, buildTokens, createJDLLexer } from './parsing/lexer/lexer.ts';
import { checkConfigKeys, checkTokens } from './parsing/self-checks/parsing-system-checker.ts';
import type { JDLApplicationConfig, JDLValidatorOption } from './types/parsing.ts';
import type { JDLRuntime } from './types/runtime.ts';

/**
 * @param definition the application JDL definitions.
 * @param deploymentDefinition the deployment JDL definitions, the ones of the deployment generators by default.
 */
export const createRuntime = (
  definition: JDLApplicationConfig,
  deploymentDefinition: JDLApplicationConfig = getDefaultJDLDeploymentConfig(),
): JDLRuntime => {
  const propertyValidations: Record<string, JDLValidatorOption> = definition.validatorConfig;
  const deploymentPropertyValidations: Record<string, JDLValidatorOption> = deploymentDefinition.validatorConfig;
  const deploymentOptionTypes = deploymentDefinition.optionsTypes;
  const applicationDefinition = new JDLApplicationDefinition({
    optionValues: definition.optionsValues,
    optionTypes: definition.optionsTypes,
    quotedOptionNames: definition.quotedOptionNames,
  });

  let jdlTokens: JDLTokens;
  let lexer: Lexer;
  let parser: JDLParser;
  const getJDLTokens = () => {
    if (!jdlTokens) {
      const applicationTokens = buildApplicationTokens(definition.tokenConfigs);
      const deploymentTokens = buildDeploymentTokens(deploymentDefinition.tokenConfigs);
      jdlTokens = buildTokens({ applicationTokens, deploymentTokens });

      // The application config keys are tokens of their lexer mode, checked against the validations by name.
      const applicationConfigTokens = Object.fromEntries(applicationTokens.tokens.map(token => [token.name, token]));
      checkConfigKeys({ ...jdlTokens.tokens, ...applicationConfigTokens }, Object.keys(propertyValidations));
    }
    return jdlTokens;
  };

  return {
    get tokens(): Record<string, TokenType> {
      return getJDLTokens().tokens;
    },
    get lexer(): Lexer {
      if (!lexer) {
        lexer = createJDLLexer(getJDLTokens());
      }
      return lexer;
    },
    get parser(): JDLParser {
      if (!parser) {
        parser = new JDLParser(this.tokens);
        parser.parse();
        const rules = parser.getGAstProductions();
        checkTokens(allTokens(getJDLTokens()), Object.values(rules));
      }

      return parser;
    },
    applicationDefinition,
    propertyValidations,
    deploymentPropertyValidations,
    deploymentOptionTypes,
  };
};

let defaultRuntime: JDLRuntime;
/** The runtime of the definitions of the generators, the one to use when no definition is given. */
export const getDefaultRuntime = (): JDLRuntime => {
  defaultRuntime ??= createRuntime(getDefaultJDLApplicationConfig());
  return defaultRuntime;
};
