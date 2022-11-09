import type { Control } from './types.mjs';

type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type> = Record<string, GenericTask<ThisType, Arg1Type>>;

type BasicTaskGroup<ThisType, Arg1Type> = GenericTaskGroup<ThisType, Arg1Type>;

export type GenerericTaskParam = {
  control: Control & Record<string, boolean | string | object>;
  source: any;
};

export type BaseTaskGroup<ThisType> = GenericTaskGroup<ThisType, GenerericTaskParam>;

export {
  BaseTaskGroup as InitializingTaskGroup,
  BaseTaskGroup as PromptingTaskGroup,
  BaseTaskGroup as ConfiguringTaskGroup,
  BaseTaskGroup as ComposingTaskGroup,
  BaseTaskGroup as LoadingTaskGroup,
  BaseTaskGroup as PreparingTaskGroup,
  BaseTaskGroup as DefaultTaskGroup,
  BaseTaskGroup as WritingTaskGroup,
  BaseTaskGroup as PostWritingTaskGroup,
  BaseTaskGroup as PreConflictsTaskGroup,
  BaseTaskGroup as InstallTaskGroup,
  BaseTaskGroup as PostInstallTaskGroup,
  BaseTaskGroup as EndTaskGroup,
};
