import type { ApplicationAll as BaseApplicationApplication } from '../base-application/application-properties-all.js';
import type { EntityAll as BaseApplicationEntity } from '../base-application/entity-all.js';

export type { Source } from '../base-application/types.js';

export type Entity = BaseApplicationEntity;
export type Application<E extends Entity> = BaseApplicationApplication<E>;

export type { Config } from '../base-application/types.js';

export type { Options } from '../base-application/types.js';

export type { Features } from '../base-application/types.js';

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
