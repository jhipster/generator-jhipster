import type { Storage } from 'yeoman-generator';
import { ControlTaskParam, BaseGeneratorDefinition, SourceTaskParam, GenericSourceTypeDefinition } from '../base/tasks.js';
import { CommonClientServerApplication } from './types.js';
import { Entity, Field, Relationship } from './types/index.js';
import { ClientSourceType } from '../client/types.js';
import { BaseChangelog } from '../base-entity-changes/types.js';

export type GenericApplicationDefinition<ApplicationType = CommonClientServerApplication> = {
  applicationType: ApplicationType;
  entityType: Entity;
};

type ConfiguringEachEntityTaskParam = {
  entityName: string;
  /** Entity storage */
  entityStorage: Storage;
  /** Proxy object for the entitystorage */
  entityConfig: Record<string, any>;
};

type LoadingEntitiesTaskParam = {
  entitiesToLoad: {
    entityName: string;
    /** Entity storage */
    entityStorage: Storage;
    /** Proxy object for the entitystorage */
    entityConfig: Record<string, any>;
    /** Initial entity object */
    entityBootstrap: Record<string, any>;
  }[];
};

type ApplicationTaskParam<Definition extends GenericApplicationDefinition = ControlTaskParam & GenericApplicationDefinition> = {
  application: Definition['applicationType'] & { user: Definition['entityType'] };
};

type ApplicationDefaultsTaskParam = {
  /**
   * Parameter properties accepts:
   * - functions: receives the application and the return value is set at the application property.
   * - non functions: application property will receive the property in case current value is undefined.
   *
   * Applies each object in order.
   *
   * @example
   * // application = { prop: 'foo-bar', prop2: 'foo2' }
   * applicationDefaults(
   *   application,
   *   { prop: 'foo', prop2: ({ prop }) => prop + 2 },
   *   { prop: ({ prop }) => prop + '-bar', prop2: 'won\'t override' },
   * );
   */
  applicationDefaults: (...defaults: Record<any, any>[]) => void;
};

export type EntitiesTaskParam<Definition extends GenericApplicationDefinition = GenericApplicationDefinition> = {
  entities: Definition['entityType'][];
};

type EachEntityTaskParam<Definition extends GenericApplicationDefinition = GenericApplicationDefinition> = {
  entity: Definition['entityType'];
  entityName: string;
  description: string;
};

type PreparingEachEntityFieldTaskParam<Definition extends GenericApplicationDefinition = GenericApplicationDefinition> =
  EachEntityTaskParam<Definition> & {
    field: Field;
    fieldName: string;
  };

type PreparingEachEntityRelationshipTaskParam<Definition extends GenericApplicationDefinition = GenericApplicationDefinition> =
  EachEntityTaskParam<Definition> & {
    relationship: Relationship;
    relationshipName: string;
  };

type ClientSource<ExtendsSelf = ClientSourceType> = {
  addEntitiesToClient?: (param: ControlTaskParam & { source: ExtendsSelf } & EntitiesTaskParam<GenericApplicationDefinition>) => any;
};

export type BaseApplicationGeneratorDefinition<
  Definition extends { applicationType: any; entityType: any; sourceType: any } = GenericApplicationDefinition &
    GenericSourceTypeDefinition<Record<string, (...args: any[]) => any>>,
> = BaseGeneratorDefinition<Definition> &
  // Add application to existing priorities
  Record<'loadingTaskParam' | 'preparingTaskParam', ApplicationTaskParam<Definition> & ApplicationDefaultsTaskParam> &
  Record<
    | 'postPreparingTaskParam'
    | 'defaultTaskParam'
    | 'postWritingTaskParam'
    | 'preConflictsTaskParam'
    | 'installTaskParam'
    | 'postInstallTaskParam'
    | 'endTaskParam',
    ApplicationTaskParam<Definition>
  > &
  Record<'writingTaskParam', ApplicationTaskParam<Definition> & { configChanges?: Record<string, { newValue: any; oldValue: any }> }> &
  // Add entities to existing priorities
  Record<'defaultTaskParam', EntitiesTaskParam<Definition> & { entityChanges?: BaseChangelog[] }> &
  // Add application and control to new priorities
  Record<
    | 'configuringEachEntityTaskParam'
    | 'loadingEntitiesTaskParam'
    | 'preparingEachEntityTaskParam'
    | 'preparingEachEntityFieldTaskParam'
    | 'preparingEachEntityRelationshipTaskParam'
    | 'postPreparingEachEntityTaskParam'
    | 'writingEntitiesTaskParam'
    | 'postWritingEntitiesTaskParam',
    ControlTaskParam & ApplicationTaskParam<Definition>
  > & {
    // Add additional types to each priority
    applicationType: Definition['applicationType'];
    configuringEachEntityTaskParam: ConfiguringEachEntityTaskParam;
    loadingEntitiesTaskParam: LoadingEntitiesTaskParam;
    preparingEachEntityTaskParam: EachEntityTaskParam<Definition>;
    preparingEachEntityFieldTaskParam: PreparingEachEntityFieldTaskParam<Definition>;
    preparingEachEntityRelationshipTaskParam: PreparingEachEntityRelationshipTaskParam<Definition>;
    postPreparingEachEntityTaskParam: EachEntityTaskParam<Definition>;
    writingEntitiesTaskParam: EntitiesTaskParam<Definition> & { entityChanges?: BaseChangelog[] };
    postWritingEntitiesTaskParam: SourceTaskParam<Definition> & EntitiesTaskParam<Definition> & { entityChanges?: BaseChangelog[] };
  };
