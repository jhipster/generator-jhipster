import type { Relationship as JavaRelationship } from '../java/index.ts';

export interface RelationshipAll extends JavaRelationship {
  propertyJavaBeanName?: string;
  propertyDtoJavaType?: string;

  onDelete?: boolean;
  onUpdate?: boolean;

  /* TODO check motivation */
  relationshipSqlSafeName?: string;
  relationshipJavadoc?: string;
  relationshipApiDescription?: string;
  columnDataType?: string;
}
