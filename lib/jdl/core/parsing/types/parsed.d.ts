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
import type { JDLRelationshipType } from '../relationship-types.ts';

/** Where a node was written, from its first token to its last one. Lines and columns start at 1, `endOffset` is inclusive. */
export type JDLLocation = {
  startOffset: number;
  endOffset: number;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
};

/** A node of the AST built by the parser knows where it was written; the property is not enumerable. */
export type Located = {
  readonly location?: JDLLocation;
};

/** A record node knows where each of its keys was written, the whole `key value` statement; the property is not enumerable. */
export type KeyLocated = {
  readonly keyLocations?: Record<string, JDLLocation | undefined>;
};

export type ParsedJDLAnnotation = Located & {
  optionName: string;
  type: 'UNARY' | 'BINARY';
  optionValue?: boolean | string | number;
};

export type ParsedJDLValidation = Located & {
  key: string;
  value?: string | number | RegExp | boolean;
  constant?: boolean;
};

export type ParsedJDLEntityField = Located & {
  annotations?: ParsedJDLAnnotation[];
  validations: ParsedJDLValidation[];
  name: string;
  type: string;
  /** The javadoc comment before the declaration, null when there is none. */
  documentation?: string | null;
};

export type ParsedJDLEntity = Located & {
  name: string;
  tableName?: string;
  /** The javadoc comment before the declaration, null when there is none. */
  documentation?: string | null;
  annotations?: ParsedJDLAnnotation[];
  body?: ParsedJDLEntityField[];
};
export type ParsedJDLApplicationConfig = KeyLocated & {
  baseName: string;
} & Record<string, any>;

export type ParsedJDLEnumValue = Located & {
  key: string;
  value?: string;
  comment?: string;
};

export type ParsedJDLEnum = Located & {
  name: string;
  values: ParsedJDLEnumValue[];
  /** The javadoc comment before the declaration, null when there is none. */
  documentation?: string | null;
};

/**
 * The entities of an option; its key locations are where each entity name is written, its location the first statement
 * of the option.
 */
export type ParsedJDLOptionConfig = Located &
  KeyLocated & {
    list: string[]; // entity names
    excluded: string[]; // excluded entity names
  };

export type ParsedJDLOption = {
  optionName: string;
  /** The `with` value of a binary option statement. */
  optionValue?: string;
} & ParsedJDLOptionConfig;

export type ParsedJDLBinaryOption = {
  optionValue: string;
} & ParsedJDLOption;

export type ParsedJDLUseOption = Located & {
  optionValues: string[];
} & ParsedJDLOptionConfig;

export type ParsedJDLApplication = Located & {
  config: ParsedJDLApplicationConfig;
  namespaceConfigs?: Record<string, KeyLocated & Record<string, boolean | number | string[] | string>>;
  entities?: string[];
  options?: Record<string, ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>>;
  useOptions?: ParsedJDLUseOption[];
};

/** A deployment as written, one entry per option: they are checked after parsing, `deploymentType` included. */
export type ParsedJDLDeployment = Located &
  KeyLocated &
  Record<string, string | boolean | string[] | undefined> & {
    deploymentType?: string;
    appsFolders?: string[];
    dockerRepositoryName?: string;
  };

export type ParsedJDLRelationshipSide = Located & {
  name: string;
  injectedField?: string;
  required: boolean;
  /** The javadoc comment before the declaration, null when there is none. */
  documentation?: string | null;
};

export type ParsedJDLRelationshipOption = {
  global: ParsedJDLAnnotation[];
  source: ParsedJDLAnnotation[];
  destination: ParsedJDLAnnotation[];
};

export type ParsedJDLRelationship = Located & {
  from: ParsedJDLRelationshipSide;
  to: ParsedJDLRelationshipSide;
  cardinality: JDLRelationshipType;
  options: ParsedJDLRelationshipOption;
};

/** An application as the parser writes it: the entities statement is resolved into `entities` after parsing. */
export type ParsedJDLApplicationDeclaration = ParsedJDLApplication & {
  /** The entities statement; its key locations are where each entity name is written. */
  entitiesOptions?: KeyLocated & { entityList: string[]; excluded: string[] };
};

export type ParsedJDLApplications = {
  applications: ParsedJDLApplicationDeclaration[];
  entities: ParsedJDLEntity[];
  relationships: ParsedJDLRelationship[];
  deployments: ParsedJDLDeployment[];
  enums: ParsedJDLEnum[];
  constants: KeyLocated & Record<string, string>;
  options: Record<string, ParsedJDLOption | Record<string, ParsedJDLOption>>;
  useOptions: ParsedJDLUseOption[];
};
