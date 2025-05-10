import type { BaseControl, BaseSources } from './types.js';

/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type TaskParamWithControl<C extends BaseControl> = {
  control: C & Record<string, boolean | string | object>;
};

export type TaskParamWithSource<C extends BaseControl, Source extends BaseSources<any, any>> = TaskParamWithControl<C> & {
  source: Source;
};

export type TaskTypes<C extends BaseControl, Source extends BaseSources<any, any>> = {
  InitializingTaskParam: TaskParamWithControl<C>;
  PromptingTaskParam: TaskParamWithControl<C>;
  ConfiguringTaskParam: TaskParamWithControl<C>;
  ComposingTaskParam: TaskParamWithControl<C>;
  LoadingTaskParam: TaskParamWithControl<C>;
  PreparingTaskParam: TaskParamWithSource<C, Source>;
  PostPreparingTaskParam: TaskParamWithSource<C, Source>;
  DefaultTaskParam: TaskParamWithControl<C>;
  WritingTaskParam: TaskParamWithControl<C>;
  PostWritingTaskParam: TaskParamWithSource<C, Source>;
  PreConflictsTaskParam: TaskParamWithControl<C>;
  InstallTaskParam: TaskParamWithControl<C>;
  PostInstallTaskParam: TaskParamWithControl<C>;
  EndTaskParam: TaskParamWithControl<C>;
};

type GenericTask<Arg1Type, ThisType> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type, N extends string = string> = Record<N, GenericTask<Arg1Type, ThisType>>;
