export type { Application, Config, Entity, Field, Options, Features, Relationship, Source } from '../base-application/types.js';

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
