import type { Control as BaseControl, Source as BaseSource } from './types.js';

export type TaskParamWithControl<C extends BaseControl> = {
  control: C;
};

export type TaskParamWithSource<C extends BaseControl, S extends BaseSource> = TaskParamWithControl<C> & {
  source: S;
};

export type TaskTypes<C extends BaseControl = BaseControl, S extends BaseSource = BaseSource> = {
  InitializingTaskParam: TaskParamWithControl<C>;
  PromptingTaskParam: TaskParamWithControl<C>;
  ConfiguringTaskParam: TaskParamWithControl<C>;
  ComposingTaskParam: TaskParamWithControl<C>;
  LoadingTaskParam: TaskParamWithControl<C>;
  PreparingTaskParam: TaskParamWithSource<C, S>;
  PostPreparingTaskParam: TaskParamWithSource<C, S>;
  DefaultTaskParam: TaskParamWithControl<C>;
  WritingTaskParam: TaskParamWithControl<C> & { configChanges?: Record<string, { newValue: any; oldValue: any }> };
  PostWritingTaskParam: TaskParamWithSource<C, S>;
  PreConflictsTaskParam: TaskParamWithControl<C>;
  InstallTaskParam: TaskParamWithControl<C>;
  PostInstallTaskParam: TaskParamWithControl<C>;
  EndTaskParam: TaskParamWithControl<C>;
};
