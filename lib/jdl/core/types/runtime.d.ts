import type { Lexer, TokenType } from 'chevrotain';

import type JDLApplicationDefinition from '../built-in-options/jdl-application-definition.ts';
import type JDLParser from '../parsing/jdl-parser.ts';

import type { JDLValidatorOption } from './parsing.ts';

export type JDLRuntime = {
  applicationDefinition: JDLApplicationDefinition;
  tokens: Record<string, TokenType>;
  lexer: Lexer;
  parser: JDLParser;
  propertyValidations: Record<string, JDLValidatorOption>;
  deploymentPropertyValidations: Record<string, JDLValidatorOption>;
  /** The deployment options, with their types and allowed values, as the applicationDefinition holds the application ones. */
  deploymentDefinition: JDLApplicationDefinition;
};
