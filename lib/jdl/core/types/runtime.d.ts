import type { Lexer, TokenType } from 'chevrotain';
import type JDLParser from '../parsing/jdl-parser.ts';
import type JDLApplicationDefinition from '../built-in-options/jdl-application-definition.ts';
import type { JDLValidatorOption } from './parsing.js';

export type JDLRuntime = {
  applicationDefinition: JDLApplicationDefinition;
  tokens: Record<string, TokenType>;
  lexer: Lexer;
  parser: JDLParser;
  propertyValidations: Record<string, JDLValidatorOption>;
};
