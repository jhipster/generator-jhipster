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

import JDLApplicationDefinition from './built-in-options/jdl-application-definition.ts';
import { buildApplicationTokens } from './built-in-options/tokens/application-tokens.ts';
import { buildDeploymentTokens } from './built-in-options/tokens/deployment-tokens.ts';
import { buildEntityTokens } from './built-in-options/tokens/entity-tokens.ts';
import JDLParser from './parsing/jdl-parser.ts';
import { type JDLTokens, allTokens, buildTokens, createJDLLexer } from './parsing/lexer/lexer.ts';
import { checkConfigKeys, checkTokens } from './parsing/self-checks/parsing-system-checker.ts';
import type { JDLDefinitions, JDLValidatorOption } from './types/parsing.ts';
import type { JDLRuntime } from './types/runtime.ts';

/**
 * Builds a runtime, the lexer, the parser and the definitions the jdl is parsed and validated with, from every definition:
 * the core knows no option by itself, `lib/jdl-config` provides the default ones.
 */
export const createRuntime = ({
  application: definition,
  deployment: deploymentDefinition,
  entity: entityDefinition,
  relationship: relationshipDefinition,
}: JDLDefinitions): JDLRuntime => {
  const propertyValidations: Record<string, JDLValidatorOption> = definition.validatorConfig;
  const deploymentPropertyValidations: Record<string, JDLValidatorOption> = deploymentDefinition.validatorConfig;
  const applicationDefinition = new JDLApplicationDefinition({
    optionValues: definition.optionsValues,
    optionTypes: definition.optionsTypes,
    quotedOptionNames: definition.quotedOptionNames,
  });
  const jdlDeploymentDefinition = new JDLApplicationDefinition({
    optionValues: deploymentDefinition.optionsValues,
    optionTypes: deploymentDefinition.optionsTypes,
    quotedOptionNames: deploymentDefinition.quotedOptionNames,
  });

  let jdlTokens: JDLTokens;
  let lexer: Lexer;
  let parser: JDLParser;
  const getJDLTokens = () => {
    if (!jdlTokens) {
      const applicationTokens = buildApplicationTokens(definition.tokenConfigs);
      const deploymentTokens = buildDeploymentTokens(deploymentDefinition.tokenConfigs);
      const entityTokens = buildEntityTokens(entityDefinition, relationshipDefinition);
      jdlTokens = buildTokens({ applicationTokens, deploymentTokens, entityTokens });

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
    entityDefinition,
    relationshipDefinition,
    propertyValidations,
    deploymentPropertyValidations,
    deploymentDefinition: jdlDeploymentDefinition,
  };
};
