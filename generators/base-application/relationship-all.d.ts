import type { Relationship as SpringDataRelationalRelationship } from '../spring-data-relational/index.ts';

export interface RelationshipAll extends SpringDataRelationalRelationship {
  propertyDtoJavaType?: string;

  onDelete?: boolean;
  onUpdate?: boolean;

  /* TODO check motivation */
  relationshipJavadoc?: string;
  relationshipApiDescription?: string;
  columnDataType?: string;
}
