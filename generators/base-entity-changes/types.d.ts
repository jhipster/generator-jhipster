import type {
  BaseApplicationConfig,
  BaseApplicationFeatures,
  BaseApplicationOptions,
  BaseApplicationSource,
} from '../base-application/types.d.ts';

export type BaseEntityChangesSource = BaseApplicationSource;

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

export type BaseEntityChangesConfig = BaseApplicationConfig;

export type BaseEntityChangesOptions = BaseApplicationOptions;

export type BaseEntityChangesFeatures = BaseApplicationFeatures;
