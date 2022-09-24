export type Application = Record<string, any>;

type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => Promise<void>;
type GenericTaskGroup<ThisType, Arg1Type> = Record<string, GenericTask<ThisType, Arg1Type>>;

export type BasicTaskGroup<ThisType> = GenericTaskGroup<ThisType, undefined>;

type ApplicationTaskParam<ApplicationType> = { application: ApplicationType };
type ApplicationTaskGroup<ThisType, ApplicationType> = GenericTaskGroup<ThisType, ApplicationTaskParam<ApplicationType>>;

type ConfiguringEachEntityTaskParam<ApplicationType> = ApplicationTaskParam<ApplicationType> & {
  entityName: string;
  /** Entity storage */
  entityStorage: import('yeoman-generator/lib/util/storage');
  /** Proxy object for the entitystorage */
  entityConfig: Record<string, any>;
};
type ConfiguringEachEntityTaskGroup<ThisType, ApplicationType> = GenericTaskGroup<
  ThisType,
  ConfiguringEachEntityTaskParam<ApplicationType>
>;

type EachEntityTaskParam<ApplicationType> = ApplicationTaskParam<ApplicationType> & {
  entity: Record<string, any>;
  entityName: string;
  description: string;
};

type EachEntityTaskGroup<ThisType, ApplicationType> = GenericTaskGroup<ThisType, EachEntityTaskParam<ApplicationType>>;

type PreparingEachEntityFieldTaskParam<ApplicationType> = EachEntityTaskParam<ApplicationType> & {
  field: Record<string, any>;
  fieldName: string;
};
type PreparingEachEntityFieldTaskGroup<ThisType, ApplicationType> = GenericTaskGroup<
  ThisType,
  PreparingEachEntityFieldTaskParam<ApplicationType>
>;

type PreparingEachEntityRelationshipTaskParam<ApplicationType> = EachEntityTaskParam<ApplicationType> & {
  relationship: Record<string, any>;
  relationshipName: string;
};
type PreparingEachEntityRelationshipTaskGroup<ThisType, ApplicationType> = GenericTaskGroup<
  ThisType,
  PreparingEachEntityRelationshipTaskParam<ApplicationType>
>;

type EntitiesTaskParam<ApplicationType> = EachEntityTaskParam<ApplicationType> & { entities: Record<string, any>[] };

type EntitiesTaskGroup<ThisType, ApplicationType> = GenericTaskGroup<ThisType, EntitiesTaskParam<ApplicationType>>;

export {
  BasicTaskGroup as InitializingTaskGroup,
  BasicTaskGroup as PromptingTaskGroup,
  BasicTaskGroup as ConfiguringTaskGroup,
  BasicTaskGroup as ComposingTaskGroup,
  ApplicationTaskGroup as LoadingTaskGroup,
  ApplicationTaskGroup as PreparingTaskGroup,
  ConfiguringEachEntityTaskGroup,
  EachEntityTaskGroup as LoadingEachEntityTaskGroup,
  EachEntityTaskGroup as PreparingEachEntityTaskGroup,
  PreparingEachEntityFieldTaskGroup,
  PreparingEachEntityRelationshipTaskGroup,
  EachEntityTaskGroup as PostPreparingEachEntityTaskGroup,
  ApplicationTaskGroup as DefaultTaskGroup,
  ApplicationTaskGroup as WritingTaskGroup,
  EntitiesTaskGroup as WritingEntitiesTaskGroup,
  ApplicationTaskGroup as PostWritingTaskGroup,
  EntitiesTaskGroup as PostWritingEntitiesTaskGroup,
  ApplicationTaskGroup as InstallTaskGroup,
  ApplicationTaskGroup as PostInstallTaskGroup,
  ApplicationTaskGroup as EndTaskGroup,
};
