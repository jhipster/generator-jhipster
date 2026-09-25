import type { Lexer, TokenType } from 'chevrotain';

import type JDLApplicationDefinition from '../jdl-application-definition.ts';
import type JDLParser from '../jdl-parser.ts';
import type { JDLSemanticRule } from '../semantic/types.ts';

import type { JDLFieldTypesDefinition, JDLOptionsDefinition, JDLValidationsDefinition, JDLValidatorOption } from './parsing.ts';

export type JDLRuntime = {
  applicationDefinition: JDLApplicationDefinition;
  /** The option statements of entities. */
  entityDefinition: JDLOptionsDefinition;
  /** The option statements of relationships: the ones of the language, `builtInEntity`, and the ones of the tool. */
  relationshipDefinition: JDLOptionsDefinition;
  /** The field validations written with a value. */
  validationDefinition: JDLValidationsDefinition;
  /** The entities a relationship `with builtInEntity` may relate to; without them, any destination is accepted. */
  builtInEntities?: readonly string[];
  /** The field types and their validations; without them, a field takes any type and any validation. */
  fieldTypesDefinition?: JDLFieldTypesDefinition;
  /** The semantic rules the jdl is checked with: the ones of the jdl, then the ones of the tool. */
  semanticRules: readonly JDLSemanticRule[];
  tokens: Record<string, TokenType>;
  lexer: Lexer;
  parser: JDLParser;
  /** A parser that goes on after an error, for the tools that want every error and what could be parsed. */
  recoveringParser: JDLParser;
  propertyValidations: Record<string, JDLValidatorOption>;
  deploymentPropertyValidations: Record<string, JDLValidatorOption>;
  /** The deployment options, with their types and allowed values, as the applicationDefinition holds the application ones. */
  deploymentDefinition: JDLApplicationDefinition;
};
