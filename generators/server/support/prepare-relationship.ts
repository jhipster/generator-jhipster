import { mutateData } from '../../../lib/utils/index.ts';
import { formatDocAsApiDescription, formatDocAsJavaDoc } from '../../java/support/doc.ts';
import type { DatabaseEntity, DatabaseRelationship } from '../../liquibase/types.js';
import type { Application as ServerApplication, Entity as ServerEntity, Relationship as ServerRelationship } from '../types.ts';
import { getJoinTableName } from './database.ts';
import { hibernateSnakeCase } from './string.ts';

export function prepareRelationshipForDatabase({
  application,
  entity,
  relationship,
}: {
  application: ServerApplication<DatabaseEntity>;
  entity: DatabaseEntity;
  relationship: DatabaseRelationship;
}) {
  // Database properties are used by liquibase and spring-boot there is no inheritance between them.
  mutateData(relationship as DatabaseRelationship, {
    // DB properties
    columnName: ({ relationshipName }) => hibernateSnakeCase(relationshipName),
    shouldWriteJoinTable: ({ ownerSide, relationshipManyToMany }) => application.databaseTypeSql && relationshipManyToMany && ownerSide,
    joinTable: ({ shouldWriteJoinTable, relationshipName }) =>
      shouldWriteJoinTable
        ? {
            name: getJoinTableName(entity.entityTableName, relationshipName, {
              prodDatabaseType: application.prodDatabaseType,
            }).value,
          }
        : undefined,
  });
}

export function prepareRelationship({
  application,
  entity,
  relationship,
}: {
  application: ServerApplication;
  entity: ServerEntity;
  relationship: ServerRelationship;
}) {
  if (relationship.documentation) {
    mutateData(relationship, {
      __override__: false,
      relationshipJavadoc: formatDocAsJavaDoc(relationship.documentation, 4),
      relationshipApiDescription: formatDocAsApiDescription(relationship.documentation),
      propertyApiDescription: ({ relationshipApiDescription }) => relationshipApiDescription,
    });
  }

  prepareRelationshipForDatabase({ application, entity, relationship });
}
