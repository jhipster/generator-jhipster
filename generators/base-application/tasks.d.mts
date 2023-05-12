import type { Storage } from 'yeoman-generator';
import { ControlTaskParam, BaseGeneratorDefinition, SourceTaskParam, GenericSourceTypeDefinition } from '../base/tasks.mjs';
import { CommonClientServerApplication } from './types.mjs';
import { Entity, Field, Relationship } from './types/index.mjs';
import { ClientSourceType } from '../client/types.mjs';

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
  }[];
};

type ApplicationTaskParam<Definition extends GenericApplicationDefinition = ControlTaskParam & GenericApplicationDefinition> = {
  application: Definition['applicationType'] & { user: Definition['entityType'] };
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
    GenericSourceTypeDefinition<Record<string, (...args: any[]) => any>>
> = BaseGeneratorDefinition<Definition> &
  // Add application to existing priorities
  Record<
    | 'loadingTaskParam'
    | 'preparingTaskParam'
    | 'defaultTaskParam'
    | 'writingTaskParam'
    | 'postWritingTaskParam'
    | 'preConflictsTaskParam'
    | 'installTaskParam'
    | 'postInstallTaskParam'
    | 'endTaskParam',
    ApplicationTaskParam<Definition>
  > &
  // Add entities to existing priorities
  Record<'defaultTaskParam', EntitiesTaskParam<Definition>> &
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
    writingEntitiesTaskParam: EntitiesTaskParam<Definition>;
    postWritingEntitiesTaskParam: SourceTaskParam<Definition> & EntitiesTaskParam<Definition>;
  };
