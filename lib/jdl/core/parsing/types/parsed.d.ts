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

/** What a node of the AST is: the parser sets it on every node, not enumerable, like the location. */
export type JDLNodeKind =
  | 'JDL'
  | 'Constants'
  | 'Application'
  | 'ApplicationConfig'
  | 'NamespaceConfig'
  | 'ApplicationEntities'
  | 'Deployment'
  | 'Entity'
  | 'Field'
  | 'Annotation'
  | 'Validation'
  | 'Enum'
  | 'EnumValue'
  | 'Relationship'
  | 'RelationshipSide'
  | 'RelationshipOptions'
  | 'Option'
  | 'UseOption';

/** A node of the AST built by the parser knows its kind; the property is not enumerable. */
export type Kinded<K extends JDLNodeKind> = {
  readonly kind?: K;
};

export type ParsedJDLAnnotation = Located &
  Kinded<'Annotation'> & {
    optionName: string;
    type: 'UNARY' | 'BINARY';
    optionValue?: boolean | string | number;
  };

export type ParsedJDLValidation = Located &
  Kinded<'Validation'> & {
    key: string;
    value?: string | number | RegExp | boolean;
    constant?: boolean;
  };

export type ParsedJDLEntityField = Located &
  Kinded<'Field'> & {
    annotations?: ParsedJDLAnnotation[];
    validations: ParsedJDLValidation[];
    name: string;
    type: string;
    /** The javadoc comment before the declaration, null when there is none. */
    documentation?: string | null;
  };

export type ParsedJDLEntity = Located &
  Kinded<'Entity'> & {
    /** Where the braces of the fields are, when the entity is declared with them; not enumerable. */
    readonly bodyLocation?: JDLLocation;
    name: string;
    tableName?: string;
    /** The javadoc comment before the declaration, null when there is none. */
    documentation?: string | null;
    annotations?: ParsedJDLAnnotation[];
    body?: ParsedJDLEntityField[];
  };
export type ParsedJDLApplicationConfig = KeyLocated &
  Kinded<'ApplicationConfig'> & {
    baseName: string;
  } & Record<string, any>;

export type ParsedJDLEnumValue = Located &
  Kinded<'EnumValue'> & {
    key: string;
    value?: string;
    comment?: string;
  };

export type ParsedJDLEnum = Located &
  Kinded<'Enum'> & {
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

export type ParsedJDLOption = Kinded<'Option'> & {
  optionName: string;
  /** The `with` value of a binary option statement. */
  optionValue?: string;
} & ParsedJDLOptionConfig;

export type ParsedJDLBinaryOption = {
  optionValue: string;
} & ParsedJDLOption;

export type ParsedJDLUseOption = Located &
  Kinded<'UseOption'> & {
    optionValues: string[];
  } & ParsedJDLOptionConfig;

export type ParsedJDLApplication = Located &
  Kinded<'Application'> & {
    config: ParsedJDLApplicationConfig;
    namespaceConfigs?: Record<
      string,
      Located & KeyLocated & Kinded<'NamespaceConfig'> & Record<string, boolean | number | string[] | string>
    >;
    entities?: string[];
    options?: Record<string, ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>>;
    useOptions?: ParsedJDLUseOption[];
  };

/** A deployment as written, one entry per option: they are checked after parsing, `deploymentType` included. */
export type ParsedJDLDeployment = Located &
  KeyLocated &
  Kinded<'Deployment'> &
  Record<string, string | boolean | string[] | undefined> & {
    deploymentType?: string;
    appsFolders?: string[];
    dockerRepositoryName?: string;
  };

export type ParsedJDLRelationshipSide = Located &
  Kinded<'RelationshipSide'> & {
    name: string;
    injectedField?: string;
    required: boolean;
    /** The javadoc comment before the declaration, null when there is none. */
    documentation?: string | null;
  };

export type ParsedJDLRelationshipOption = Kinded<'RelationshipOptions'> & {
  global: ParsedJDLAnnotation[];
  source: ParsedJDLAnnotation[];
  destination: ParsedJDLAnnotation[];
};

export type ParsedJDLRelationship = Located &
  Kinded<'Relationship'> & {
    /** Where the relationship declaration it is part of is, which may declare several; not enumerable. */
    readonly declarationLocation?: JDLLocation;
    from: ParsedJDLRelationshipSide;
    to: ParsedJDLRelationshipSide;
    cardinality: JDLRelationshipType;
    options: ParsedJDLRelationshipOption;
  };

/** An application as the parser writes it: the entities statement is resolved into `entities` after parsing. */
export type ParsedJDLApplicationDeclaration = ParsedJDLApplication & {
  /** The entities statement; its key locations are where each entity name is written. */
  entitiesOptions?: KeyLocated & Kinded<'ApplicationEntities'> & { entityList: string[]; excluded: string[] };
};

export type ParsedJDLApplications = Kinded<'JDL'> & {
  applications: ParsedJDLApplicationDeclaration[];
  entities: ParsedJDLEntity[];
  relationships: ParsedJDLRelationship[];
  deployments: ParsedJDLDeployment[];
  enums: ParsedJDLEnum[];
  constants: KeyLocated & Kinded<'Constants'> & Record<string, string>;
  options: Record<string, ParsedJDLOption | Record<string, ParsedJDLOption>>;
  useOptions: ParsedJDLUseOption[];
};
