import type { Control } from './types.mjs';

export type ControlTaskParam = {
  control: Control & Record<string, boolean | string | object>;
};

export type GenericSourceTypeDefinition<SourceType = unknown> = { sourceType: SourceType };

export type SourceTaskParam<Definition extends GenericSourceTypeDefinition> = {
  source: Definition['sourceType'];
};

export type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type = ControlTaskParam> = Record<string, GenericTask<ThisType, Arg1Type>>;

export type BaseGeneratorDefinition<Definition extends GenericSourceTypeDefinition = GenericSourceTypeDefinition> = Record<
  | 'initializingTaskParam'
  | 'promptingTaskParam'
  | 'configuringTaskParam'
  | 'composingTaskParam'
  | 'loadingTaskParam'
  | 'preparingTaskParam'
  | 'defaultTaskParam'
  | 'writingTaskParam'
  | 'postWritingTaskParam'
  | 'preConflictsTaskParam'
  | 'installTaskParam'
  | 'postInstallTaskParam'
  | 'endTaskParam',
  ControlTaskParam
> &
  Record<'preparingTaskParam' | 'postWritingTaskParam', SourceTaskParam<Definition>>;
