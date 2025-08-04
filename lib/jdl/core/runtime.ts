import type { Lexer, TokenType } from 'chevrotain';

import { builtInJDLApplicationConfig } from '../../jhipster/application-options.ts';

import JDLApplicationDefinition from './built-in-options/jdl-application-definition.ts';
import { buildApplicationTokens } from './built-in-options/tokens/application-tokens.ts';
import { deploymentTokens } from './built-in-options/tokens/deployment-tokens.ts';
import JDLParser from './parsing/jdl-parser.ts';
import { buildTokens, createJDLLexer } from './parsing/lexer/lexer.ts';
import { checkConfigKeys, checkTokens } from './parsing/self-checks/parsing-system-checker.ts';
import type { JDLApplicationConfig, JDLValidatorOption } from './types/parsing.ts';
import type { JDLRuntime } from './types/runtime.ts';

const mergeDefinition = (definition: JDLApplicationConfig, defaultDefinition: JDLApplicationConfig) => {
  return {
    validatorConfig: {
      ...defaultDefinition.validatorConfig,
      ...definition.validatorConfig,
    },
    optionsValues: {
      ...defaultDefinition.optionsValues,
      ...definition.optionsValues,
    },
    optionsTypes: {
      ...defaultDefinition.optionsTypes,
      ...definition.optionsTypes,
    },
    quotedOptionNames: [...defaultDefinition.quotedOptionNames, ...definition.quotedOptionNames],
    tokenConfigs: [...defaultDefinition.tokenConfigs, ...definition.tokenConfigs],
  };
};

export const createRuntime = (definition?: JDLApplicationConfig): JDLRuntime => {
  const newDefinition = definition ? mergeDefinition(definition, builtInJDLApplicationConfig) : builtInJDLApplicationConfig;
  const propertyValidations: Record<string, JDLValidatorOption> = newDefinition.validatorConfig;
  const applicationDefinition = new JDLApplicationDefinition({
    optionValues: newDefinition.optionsValues,
    optionTypes: newDefinition.optionsTypes,
    quotedOptionNames: newDefinition.quotedOptionNames,
  });

  let tokens: Record<string, TokenType>;
  let lexer: Lexer;
  let parser: JDLParser;

  return {
    get tokens(): Record<string, TokenType> {
      if (!tokens) {
        const applicationTokens = buildApplicationTokens(newDefinition.tokenConfigs);
        tokens = buildTokens({ applicationTokens, deploymentTokens });

        checkConfigKeys(tokens, Object.keys(propertyValidations));
      }
      return tokens;
    },
    get lexer(): Lexer {
      if (!lexer) {
        lexer = createJDLLexer(this.tokens);
      }
      return lexer;
    },
    get parser(): JDLParser {
      if (!parser) {
        parser = new JDLParser(this.tokens);
        parser.parse();
        const rules = parser.getGAstProductions();
        checkTokens(Object.values(this.tokens), Object.values(rules));
      }

      return parser;
    },
    applicationDefinition,
    propertyValidations,
  };
};
