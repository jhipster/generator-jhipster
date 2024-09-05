import type { TaskParamWithControl as ControlTaskParam } from '../../lib/types/base/tasks.js';

export type GenericSourceTypeDefinition<SourceType = unknown> = { sourceType: SourceType };

export type SourceTaskParam<Definition extends GenericSourceTypeDefinition> = {
  source: Definition['sourceType'];
};

export type GenericTask<Arg1Type, ThisType> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type = ControlTaskParam, N extends string = string> = Record<N, GenericTask<Arg1Type, ThisType>>;

export type BaseGeneratorDefinition<Definition extends GenericSourceTypeDefinition = GenericSourceTypeDefinition> = Record<
  | 'initializingTaskParam'
  | 'promptingTaskParam'
  | 'configuringTaskParam'
  | 'composingTaskParam'
  | 'loadingTaskParam'
  | 'defaultTaskParam'
  | 'writingTaskParam'
  | 'postWritingTaskParam'
  | 'preConflictsTaskParam'
  | 'installTaskParam'
  | 'postInstallTaskParam'
  | 'endTaskParam',
  ControlTaskParam
> &
  Record<'preparingTaskParam' | 'postPreparingTaskParam' | 'postWritingTaskParam', SourceTaskParam<Definition>>;
