import type { Control } from './types.mjs';

export type GenerericTaskParam = {
  control: Control & Record<string, boolean | string | object>;
  source: any;
};

export type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => unknown;

export type GenericTaskGroup<ThisType, Arg1Type = GenerericTaskParam> = Record<string, GenericTask<ThisType, Arg1Type>>;

export type BaseGeneratorDefinition<
  Tasks extends string =
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
    | 'endTaskParam'
> = Record<Tasks, GenerericTaskParam>;
