import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../base-application/types.ts';
export type { Application, Config, Features, Options, Relationship, Source } from '../base-application/types.ts';

export type Field = BaseApplicationField & {
  defaultValue?: any;
  defaultValueComputed?: any;
};

export interface Entity<
  Field extends BaseApplicationField = BaseApplicationField,
  Relationship extends BaseApplicationRelationship = BaseApplicationRelationship,
> extends BaseApplicationEntity<Field, Relationship> {
  incrementalChangelog?: boolean;
}

/** The data the changelog of an entity is written with, filled by the generator writing it. */
export type BaseChangelogData<E extends BaseApplicationEntity = BaseApplicationEntity> = {
  skipFakeData: boolean;
  allFields: E['fields'];
  fields: E['fields'];
  addedFields: E['fields'];
  removedFields: E['fields'];
  relationships: E['relationships'];
  addedRelationships: E['relationships'];
  removedRelationships: E['relationships'];
  relationshipsToRecreateForeignKeysOnly: E['relationships'];
  removedDefaultValueFields: E['fields'];
  addedDefaultValueFields: E['fields'];
  hasFieldConstraint: boolean;
  /** The required columns added without a default value, the existing rows have no value for. */
  requiredAddedColumnNames: string[];
  hasDefaultValueChange: boolean;
  hasRelationshipConstraint: boolean;
  shouldWriteAnyRelationship: boolean;
  requiresUpdateChangelogs: boolean;
};

export type BaseChangelog<E extends BaseApplicationEntity = BaseApplicationEntity> = {
  writeContext?: {
    entity: E;
    databaseChangelog: BaseChangelog<E>;
    changelogDate: string;
    databaseType: string;
    prodDatabaseType?: string;
    authenticationType?: string;
    jhiPrefix?: string;
    reactive: boolean | undefined;
    incrementalChangelog: boolean;
    recreateInitialChangelog: boolean;
  };
  newEntity: boolean;
  changedEntity: boolean;
  incremental: boolean;

  entityName: string;
  entity: E;

  changelogDate?: string;
  previousEntity?: E;

  fieldChangelog?: boolean;
  relationshipChangelog?: boolean;

  addedFields: E['fields'];
  removedFields: E['fields'];
  addedRelationships: E['relationships'];
  removedRelationships: E['relationships'];
  relationshipsToRecreateForeignKeysOnly: E['relationships'];
  removedDefaultValueFields: E['fields'];
  addedDefaultValueFields: E['fields'];
  changelogData?: BaseChangelogData<E>;
};
