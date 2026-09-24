import type { Lexer, TokenType } from 'chevrotain';

import type JDLApplicationDefinition from '../jdl-application-definition.ts';
import type JDLParser from '../jdl-parser.ts';

import type { JDLFieldTypesDefinition, JDLOptionsDefinition, JDLValidationsDefinition, JDLValidatorOption } from './parsing.ts';

export type JDLRuntime = {
  applicationDefinition: JDLApplicationDefinition;
  /** The option statements of entities. */
  entityDefinition: JDLOptionsDefinition;
  /** The option statements of relationships. */
  relationshipDefinition: JDLOptionsDefinition;
  /** The field validations written with a value. */
  validationDefinition: JDLValidationsDefinition;
  /** The field types and their validations; without them, a field takes any type and any validation. */
  fieldTypesDefinition?: JDLFieldTypesDefinition;
  tokens: Record<string, TokenType>;
  lexer: Lexer;
  parser: JDLParser;
  propertyValidations: Record<string, JDLValidatorOption>;
  deploymentPropertyValidations: Record<string, JDLValidatorOption>;
  /** The deployment options, with their types and allowed values, as the applicationDefinition holds the application ones. */
  deploymentDefinition: JDLApplicationDefinition;
};
