import type { Lexer, TokenType } from 'chevrotain';

import type JDLApplicationDefinition from '../built-in-options/jdl-application-definition.ts';
import type JDLParser from '../parsing/jdl-parser.ts';

import type { JDLApplicationOptionType, JDLValidatorOption } from './parsing.ts';

export type JDLRuntime = {
  applicationDefinition: JDLApplicationDefinition;
  tokens: Record<string, TokenType>;
  lexer: Lexer;
  parser: JDLParser;
  propertyValidations: Record<string, JDLValidatorOption>;
  deploymentPropertyValidations: Record<string, JDLValidatorOption>;
  deploymentOptionTypes: Record<string, JDLApplicationOptionType>;
};
