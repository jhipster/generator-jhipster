import type { Source as BaseSource, Control } from './types.js';

export type TaskParamWithControl = {
  control: Control;
};

export type TaskParamWithSource<Source> = TaskParamWithControl & {
  source: Source;
};

export type TaskTypes<Source extends BaseSource = BaseSource> = {
  InitializingTaskParam: TaskParamWithControl;
  PromptingTaskParam: TaskParamWithControl;
  ConfiguringTaskParam: TaskParamWithControl;
  ComposingTaskParam: TaskParamWithControl;
  LoadingTaskParam: TaskParamWithControl;
  PreparingTaskParam: TaskParamWithSource<Source>;
  PostPreparingTaskParam: TaskParamWithSource<Source>;
  DefaultTaskParam: TaskParamWithControl;
  WritingTaskParam: TaskParamWithControl & { configChanges?: Record<string, { newValue: any; oldValue: any }> };
  PostWritingTaskParam: TaskParamWithSource<Source>;
  PreConflictsTaskParam: TaskParamWithControl;
  InstallTaskParam: TaskParamWithControl;
  PostInstallTaskParam: TaskParamWithControl;
  EndTaskParam: TaskParamWithControl;
};
