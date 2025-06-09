import type { Source as BaseSource, Control } from './types.js';

export type TaskParamWithControl = {
  control: Control;
};

export type TaskParamWithSource<S extends BaseSource> = TaskParamWithControl & {
  source: S;
};

export type TaskTypes<S extends BaseSource = BaseSource> = {
  InitializingTaskParam: TaskParamWithControl;
  PromptingTaskParam: TaskParamWithControl;
  ConfiguringTaskParam: TaskParamWithControl;
  ComposingTaskParam: TaskParamWithControl;
  LoadingTaskParam: TaskParamWithControl;
  PreparingTaskParam: TaskParamWithSource<S>;
  PostPreparingTaskParam: TaskParamWithSource<S>;
  DefaultTaskParam: TaskParamWithControl;
  WritingTaskParam: TaskParamWithControl & { configChanges?: Record<string, { newValue: any; oldValue: any }> };
  PostWritingTaskParam: TaskParamWithSource<S>;
  PreConflictsTaskParam: TaskParamWithControl;
  InstallTaskParam: TaskParamWithControl;
  PostInstallTaskParam: TaskParamWithControl;
  EndTaskParam: TaskParamWithControl;
};
