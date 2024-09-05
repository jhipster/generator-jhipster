import type { Entity } from '../base/entity.js';
import type { Relationship as BaseRelationship } from '../base/relationship.js';

export interface Relationship<E extends Entity = Entity> extends BaseRelationship {
  propertyName: string;
  relationshipNameCapitalized: string;

  collection: boolean;
  skipClient?: boolean;
  skipServer?: boolean;
  /**
   * A persistable relationship means that the relationship will be updated in the database.
   */
  persistableRelationship: boolean;

  otherEntity: E;

  ownerSide?: boolean;
  relationshipEagerLoad?: boolean;

  propertyJavaBeanName?: string;
  propertyDtoJavaType?: string;
}
