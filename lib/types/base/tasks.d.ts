import type { Control } from '../../../generators/base/types.js';

export type TaskParamWithControl = {
  control: Control & Record<string, boolean | string | object>;
};

export type TaskParamWithSource<Source = any> = TaskParamWithControl & {
  source: Source;
};

type TaskTypes = {
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

export { TaskTypes };
