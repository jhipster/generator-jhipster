import type { Control } from '../../../generators/base/types.js';

export type TaskParamWithControl = {
  control: Control & Record<string, boolean | string | object>;
};

export type TaskParamWithSource<Source = any> = TaskParamWithControl & {
  source: Source;
};

export type TaskTypes = {
  InitializingTaskParam: TaskParamWithControl;
  PromptingTaskParam: TaskParamWithControl;
  ConfiguringTaskParam: TaskParamWithControl;
  ComposingTaskParam: TaskParamWithControl;
  LoadingTaskParam: TaskParamWithControl;
  PreparingTaskParam: TaskParamWithSource;
  PostPreparingTaskParam: TaskParamWithSource;
  DefaultTaskParam: TaskParamWithControl;
  WritingTaskParam: TaskParamWithControl;
  PostWritingTaskParam: TaskParamWithSource;
  PreConflictsTaskParam: TaskParamWithControl;
  InstallTaskParam: TaskParamWithControl;
  PostInstallTaskParam: TaskParamWithControl;
  EndTaskParam: TaskParamWithControl;
};

type GenericTask<Arg1Type, ThisType> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type, N extends string = string> = Record<N, GenericTask<Arg1Type, ThisType>>;
