import type { Relationship as BaseApplicationRelationship } from './types.d.ts';
import type { Property } from './property-all.js';

export interface Relationship extends BaseApplicationRelationship, Property {
  skipClient?: boolean;
  skipServer?: boolean;
  /**
   * A persistable relationship means that the relationship will be updated in the database.
   */
  persistableRelationship: boolean;

  id?: boolean;
  ownerSide?: boolean;
  relationshipEagerLoad?: boolean;
  relationshipRequired?: boolean;

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
