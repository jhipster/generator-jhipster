export type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type> = Record<string, GenericTask<ThisType, Arg1Type>>;

export type BasicTaskGroup<ThisType, Arg1Type> = GenericTaskGroup<ThisType, Arg1Type>;

export type NoArgTaskGroup<ThisType> = GenericTaskGroup<ThisType, never>;

export {
  NoArgTaskGroup as InitializingTaskGroup,
  NoArgTaskGroup as PromptingTaskGroup,
  NoArgTaskGroup as ConfiguringTaskGroup,
  NoArgTaskGroup as ComposingTaskGroup,
  NoArgTaskGroup as LoadingTaskGroup,
  NoArgTaskGroup as PreparingTaskGroup,
  NoArgTaskGroup as DefaultTaskGroup,
  NoArgTaskGroup as WritingTaskGroup,
  NoArgTaskGroup as PostWritingTaskGroup,
  NoArgTaskGroup as PreConflictsTaskGroup,
  NoArgTaskGroup as InstallTaskGroup,
  NoArgTaskGroup as PostInstallTaskGroup,
  NoArgTaskGroup as EndTaskGroup,
};
