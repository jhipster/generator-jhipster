import type { Control } from './types.js';

export type TaskParamWithControl = {
  control: Control;
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
  WritingTaskParam: TaskParamWithControl & { configChanges?: Record<string, { newValue: any; oldValue: any }> };
  PostWritingTaskParam: TaskParamWithSource;
  PreConflictsTaskParam: TaskParamWithControl;
  InstallTaskParam: TaskParamWithControl;
  PostInstallTaskParam: TaskParamWithControl;
  EndTaskParam: TaskParamWithControl;
};
