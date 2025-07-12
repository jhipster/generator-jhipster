import type { Relationship as SpringDataRelationalRelationship } from '../../generators/spring-data-relational/index.ts';
import type { Relationship as ServerRelationship } from '../../generators/server/index.ts';
import type { Relationship as LiquibaseRelationship } from '../../generators/liquibase/index.ts';

export interface RelationshipAll extends SpringDataRelationalRelationship, ServerRelationship, LiquibaseRelationship {}
