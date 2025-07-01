import type { Relationship as SpringDataRelationalRelationship } from '../spring-data-relational/index.ts';
import type { Relationship as ServerRelationship } from '../server/index.ts';
import type { Relationship as LiquibaseRelationship } from '../liquibase/index.ts';

export interface RelationshipAll extends SpringDataRelationalRelationship, ServerRelationship, LiquibaseRelationship {}
