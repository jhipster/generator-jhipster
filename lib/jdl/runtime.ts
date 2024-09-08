import type { Lexer, TokenType } from 'chevrotain';
import jhipsterDefinition from '../../generators/app/jdl/index.js';
import { buildTokens, createJDLLexer } from './parsing/lexer/lexer.js';
import JDLParser from './parsing/jdl-parser.js';
import { checkConfigKeys, checkTokens } from './parsing/self-checks/parsing-system-checker.js';
import type { JDLRuntime } from './types/runtime.js';
import type { JDLApplicationConfig, JDLValidatorOption } from './types/types.js';
import JDLApplicationDefinition from './built-in-options/jdl-application-definition.js';
import { buildApplicationTokens } from './parsing/lexer/application-tokens.js';
import { builtInJDLApplicationConfig } from './jhipster/application-options.js';

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

export const createRuntime = (definition: JDLApplicationConfig): JDLRuntime => {
  const newDefinition = mergeDefinition(definition, builtInJDLApplicationConfig);
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
    get tokens() {
      if (!tokens) {
        const applicationTokens = buildApplicationTokens(newDefinition.tokenConfigs);
        tokens = buildTokens(applicationTokens);

        checkConfigKeys(tokens, Object.keys(propertyValidations));
      }
      return tokens;
    },
    get lexer() {
      if (!lexer) {
        lexer = createJDLLexer(this.tokens);
      }
      return lexer;
    },
    get parser() {
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

let defaultRuntime: JDLRuntime;
export const getDefaultRuntime = () => {
  if (!defaultRuntime) {
    defaultRuntime = createRuntime(jhipsterDefinition);
  }

  return defaultRuntime;
};
