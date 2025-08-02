import type {
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
  RelationshipWithEntity,
} from '../base-application/types.js';
export type { Application, Config, Features, Options, Relationship, Source } from '../base-application/types.js';

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

export type BaseChangelogData = {
  skipFakeData: boolean;
  allFields: Field[];
  fields: Field[];
  addedFields: any[];
  removedFields: any[];
  relationships: RelationshipWithEntity<BaseApplicationRelationship, BaseApplicationEntity<Field, BaseApplicationRelationship>>[];
  addedRelationships: any[];
  removedRelationships: any[];
  relationshipsToRecreateForeignKeysOnly: any[];
  removedDefaultValueFields: any[];
  addedDefaultValueFields: any[];
  hasFieldConstraint: any;
  hasDefaultValueChange: boolean;
  hasRelationshipConstraint: any;
  shouldWriteAnyRelationship: any;
  requiresUpdateChangelogs: boolean;
};

export type BaseChangelog<E extends BaseApplicationEntity = BaseApplicationEntity> = {
  writeContext?: {
    entity: E;
    databaseChangelog: BaseChangelogData;
    changelogDate: string;
    databaseType: string;
    prodDatabaseType?: string;
    authenticationType?: string;
    jhiPrefix?: string;
    reactive: boolean | undefined;
    incrementalChangelog: never;
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
  changelogData?: BaseChangelogData;
};
