import { ControlTaskParam, BaseGeneratorDefinition, SourceTaskParam } from '../base/tasks.mjs';
import { BaseApplication } from './types.mjs';

type Field = {
  fieldName: string;
  fieldType: string;
  fieldTypeBlobContent: string;
} & Record<string, any>;

type Relationship = {
  relationshipName: string;
} & Record<string, any>;

export type Entity = {
  fields: Field[];
  relationships: Relationship[];
} & Record<string, any>;

type ApplicationDefinition = {
  applicationType: BaseApplication;
  entityType: Entity;
  sourceType: Record<string, (...args: any[]) => void>;
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

export type BaseApplicationGeneratorDefinition<Definition extends ApplicationDefinition = ApplicationDefinition> =
  BaseGeneratorDefinition<Definition> &
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
