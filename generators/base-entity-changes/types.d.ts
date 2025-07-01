import type { Field as BaseApplicationField } from '../base-application/types.js';
export type { Application, Config, Entity, Options, Features, Relationship, Source } from '../base-application/types.js';

export type Field = BaseApplicationField & {
  defaultValue?: any;
  defaultValueComputed?: any;
};

export type BaseChangelog = {
  newEntity: boolean;
  changedEntity: boolean;
  incremental: boolean;

  entityName: string;
  entity: any;

  changelogDate?: string;
  previousEntity?: any;

  addedFields: any[];
  removedFields: any[];
  addedRelationships: any[];
  removedRelationships: any[];
  relationshipsToRecreateForeignKeysOnly: any[];
  removedDefaultValueFields: any[];
  addedDefaultValueFields: any[];
  changelogData: any;
};
