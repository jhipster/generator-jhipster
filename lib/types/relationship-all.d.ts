import type { Relationship as SpringDataRelationalRelationship } from '../../generators/spring-data-relational/types.d.ts';
import type { Relationship as ServerRelationship } from '../../generators/server/types.d.ts';
import type { Relationship as LiquibaseRelationship } from '../../generators/liquibase/types.d.ts';
import type { FieldAll } from './field-all.js';

export interface RelationshipAll extends SpringDataRelationalRelationship, ServerRelationship, LiquibaseRelationship {
  bagRelationship?: boolean;
  derivedPrimaryKey?: {
    derivedFields: (FieldAll & {
      originalField: FieldAll;
      derived: boolean;
    })[];
  };
}
