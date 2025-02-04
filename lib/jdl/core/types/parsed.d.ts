/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { RelationshipType } from '../basic-types/relationships.js';

export type ParsedJDLAnnotation = {
  optionName: string;
  type: 'UNARY' | string;
  optionValue?: boolean | string | number;
};

export type ParsedJDLValidation = {
  key: string;
  value?: string | number | RegExp | boolean;
  constant?: boolean;
};

export type ParsedJDLEntityField = {
  annotations?: ParsedJDLAnnotation[];
  validations: ParsedJDLValidation[];
  name: string;
  type: string;
  documentation?: string;
};

export type ParsedJDLEntity = {
  name: string;
  tableName?: string;
  documentation?: string;
  annotations?: ParsedJDLAnnotation[];
  body?: ParsedJDLEntityField[];
};
export type ParsedJDLApplicationConfig = {
  baseName: string;
} & Record<string, any>;

export type ParsedJDLEnumValue = {
  key: string;
  value?: string;
  comment?: string;
};

export type ParsedJDLEnum = {
  name: string;
  values: ParsedJDLEnumValue[];
  documentation?: string;
};
export type ParsedJDLOption = {
  list: string[]; // entity names
  excluded: string[]; // excluded entity names
};

export type ParsedJDLUseOption = {
  optionValues: string[];
} & ParsedJDLOption;

export type ParsedJDLApplication = {
  config: ParsedJDLApplicationConfig;
  namespaceConfigs?: Record<string, Record<string, boolean | number | string[] | string>>;
  entities?: string[];
  options?: Record<string, ParsedJDLOption | Record<string, ParsedJDLOption>>;
  useOptions?: ParsedJDLUseOption[];
};

export type ParsedJDLDeployment = {
  deploymentType: string;
  appsFolders?: string[];
  dockerRepositoryName?: string;
};

export type ParsedJDLRelationshipSide = {
  name: string;
  injectedField?: string;
  required: boolean;
  documentation?: string;
};

export type ParsedJDLRelationshipOption = {
  global: ParsedJDLAnnotation[];
  source: ParsedJDLAnnotation[];
  destination: ParsedJDLAnnotation[];
};

export type ParsedJDLRelationship = {
  from: ParsedJDLRelationshipSide;
  to: ParsedJDLRelationshipSide;
  cardinality: RelationshipType;
  options: ParsedJDLRelationshipOption;
};

export type ParsedJDLApplications = {
  applications: ParsedJDLApplication[];
  entities: ParsedJDLEntity[];
  relationships: ParsedJDLRelationship[];
  deployments: ParsedJDLDeployment[];
  enums: ParsedJDLEnum[];
  constants: Record<string, string>;
  options: Record<string, ParsedJDLOption | Record<string, ParsedJDLOption>>;
  useOptions: ParsedJDLUseOption[];
};

export type ParsedJDLRoot = {
  parsedContent: ParsedJDLApplications;
  document?: ParsedJDLApplications; // deprecated
  entities?: ParsedJDLEntity[];
  applicationType?: string;
  applicationName?: string;
  databaseType?: string;
};
