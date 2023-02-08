import { ControlTaskParam, BaseGeneratorDefinition, SourceTaskParam, GenericSourceTypeDefinition } from '../base/tasks.mjs';
import { BaseApplication } from './types.mjs';
import { Entity } from './types/index.mjs';

export type GenericApplicationDefinition<ApplicationType = BaseApplication> = {
  applicationType: ApplicationType;
  entityType: Entity;
};

type ConfiguringEachEntityTaskParam = {
  entityName: string;
  /** Entity storage */
  entityStorage: import('yeoman-generator/lib/util/storage');
  /** Proxy object for the entitystorage */
  entityConfig: Record<string, any>;
};

type LoadingEntitiesTaskParam = {
  entitiesToLoad: {
    entityName: string;
    /** Entity storage */
    entityStorage: import('yeoman-generator/lib/util/storage');
    /** Proxy object for the entitystorage */
    entityConfig: Record<string, any>;
  }[];
};

type ApplicationTaskParam<Definition extends ApplicationDefinition = ControlTaskParam & ApplicationDefinition> = {
  application: Definition['applicationType'] & { user: Definition['entityType'] };
};

export type EntitiesTaskParam<Definition extends ApplicationDefinition = ApplicationDefinition> = {
  entities: Definition['entityType'][];
};

type EachEntityTaskParam<Definition extends ApplicationDefinition = ApplicationDefinition> = {
  entity: Definition['entityType'];
  entityName: string;
  description: string;
};

type PreparingEachEntityFieldTaskParam<Definition extends ApplicationDefinition = ApplicationDefinition> =
  EachEntityTaskParam<Definition> & {
    field: Field;
    fieldName: string;
  };

type PreparingEachEntityRelationshipTaskParam<Definition extends ApplicationDefinition = ApplicationDefinition> =
  EachEntityTaskParam<Definition> & {
    relationship: Relationship;
    relationshipName: string;
  };

type ClientSource<ExtendsSelf extends ClientSource = ClientSource> = {
  addEntitiesToClient?: (param: ControlTaskParam & { source: ExtendsSelf } & EntitiesTaskParam<Definition>) => any;
};

export type BaseApplicationGeneratorDefinition<
  Definition extends { applicationType: any; entityType: any; sourceType: any } = GenericApplicationDefinition &
    GenericSourceTypeDefinition<Record<string, (...args: any[]) => void>>
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
