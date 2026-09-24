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

import type { SourceRange } from '../parsing/locations.ts';

export type ParsedJDLAnnotation = {
  location?: SourceRange;
  /** True for a relationship `with` statement, rather than an arbitrary annotation. */
  statement?: boolean;
  optionName: string;
  type: 'UNARY' | 'BINARY';
  optionValue?: boolean | string | number;
};

export type ParsedJDLValidation = {
  location?: SourceRange;
  key: string;
  value?: string | number | RegExp | boolean;
  constant?: boolean;
};

export type ParsedJDLEntityField = {
  location?: SourceRange;
  annotations?: ParsedJDLAnnotation[];
  validations: ParsedJDLValidation[];
  name: string;
  type: string;
  documentation?: string;
};

export type ParsedJDLEntity = {
  location?: SourceRange;
  name: string;
  tableName?: string;
  documentation?: string;
  annotations?: ParsedJDLAnnotation[];
  body?: ParsedJDLEntityField[];
};
export type ParsedJDLApplicationConfig = {
  location?: SourceRange;
  baseName: string;
} & Record<string, any>;

export type ParsedJDLEnumValue = {
  location?: SourceRange;
  /** Quoted values can contain characters that unquoted names cannot. */
  quoted?: boolean;
  key: string;
  value?: string;
  comment?: string;
};

export type ParsedJDLEnum = {
  location?: SourceRange;
  name: string;
  values: ParsedJDLEnumValue[];
  documentation?: string;
};

export type ParsedJDLOptionConfig = {
  location?: SourceRange;
  list: string[]; // entity names
  excluded: string[]; // excluded entity names
};

export type ParsedJDLOption = {
  location?: SourceRange;
  optionName: string;
} & ParsedJDLOptionConfig;

export type ParsedJDLBinaryOption = {
  location?: SourceRange;
  optionValue: string;
} & ParsedJDLOption;

export type ParsedJDLUseOption = {
  location?: SourceRange;
  optionValues: string[];
} & ParsedJDLOptionConfig;

export type ParsedJDLApplication = {
  location?: SourceRange;
  configDeclarations?: ParsedJDLConfigDeclaration[];
  optionDeclarations?: ParsedJDLOptionDeclaration[];
  config: ParsedJDLApplicationConfig;
  namespaceConfigs?: Record<string, Record<string, boolean | number | string[] | string>>;
  entities?: string[];
  options?: Record<string, ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>>;
  useOptions?: ParsedJDLUseOption[];
};

export type ParsedJDLDeployment = {
  location?: SourceRange;
  configDeclarations?: ParsedJDLConfigDeclaration[];
  deploymentType: string;
  appsFolders?: string[];
  dockerRepositoryName?: string;
};

export type ParsedJDLRelationshipSide = {
  validationDeclarations?: ParsedJDLValidation[];
  location?: SourceRange;
  name: string;
  injectedField?: string;
  required: boolean;
  documentation?: string;
};

export type ParsedJDLRelationshipOption = {
  location?: SourceRange;
  global: ParsedJDLAnnotation[];
  source: ParsedJDLAnnotation[];
  destination: ParsedJDLAnnotation[];
};

export type ParsedJDLRelationship = {
  location?: SourceRange;
  from: ParsedJDLRelationshipSide;
  to: ParsedJDLRelationshipSide;
  cardinality: string;
  options: ParsedJDLRelationshipOption;
};

export type ParsedJDLApplications = {
  location?: SourceRange;
  applications: (ParsedJDLApplication & { entitiesOptions?: { entityList: string[]; excluded: string[] } })[];
  entities: ParsedJDLEntity[];
  relationships: ParsedJDLRelationship[];
  deployments: ParsedJDLDeployment[];
  enums: ParsedJDLEnum[];
  constants: Record<string, string>;
  constantDeclarations?: ParsedJDLConstantDeclaration[];
  optionDeclarations?: ParsedJDLOptionDeclaration[];
  options: Record<string, ParsedJDLOption | Record<string, ParsedJDLOption>>;
  useOptions: ParsedJDLUseOption[];
};

export type ParsedJDLRoot = {
  location?: SourceRange;
  parsedContent: ParsedJDLApplications;
  document?: ParsedJDLApplications; // deprecated
  entities?: ParsedJDLEntity[];
  applicationType?: 'monolith' | 'gateway' | 'microservice';
  applicationName?: string;
};

/** Declaration occurrences retain duplicates and syntax kinds for semantic diagnostics. */
export type ParsedJDLConfigDeclaration = {
  location?: SourceRange;
  key: string;
  value: string | boolean | string[];
  valueType?: 'INTEGER' | 'STRING' | 'BOOLEAN' | 'qualifiedName' | 'list' | 'quotedList';
};

export type ParsedJDLConstantDeclaration = {
  location?: SourceRange;
  name: string;
  value: string;
};

export type ParsedJDLOptionDeclaration = {
  location?: SourceRange;
  optionName: string;
  optionValue?: string;
  list: string[];
  excluded: string[];
};
