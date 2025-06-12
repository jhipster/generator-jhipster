import type { Relationship as JavaRelationship } from '../java/index.ts';

export interface RelationshipAll extends JavaRelationship {
  propertyDtoJavaType?: string;

  onDelete?: boolean;
  onUpdate?: boolean;

  /* TODO check motivation */
  relationshipJavadoc?: string;
  relationshipApiDescription?: string;
  columnDataType?: string;
}
