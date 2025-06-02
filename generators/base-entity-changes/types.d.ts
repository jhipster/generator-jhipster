import type {
  Config as BaseApplicationConfig,
  Features as BaseApplicationFeatures,
  Options as BaseApplicationOptions,
} from '../base-application/types.js';

export type { Source } from '../base-application/types.js';

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

export type Config = BaseApplicationConfig;

export type Options = BaseApplicationOptions;

export type Features = BaseApplicationFeatures;
