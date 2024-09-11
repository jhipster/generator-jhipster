import type { Entity } from '../base/entity.js';
import type { Relationship as BaseRelationship } from '../base/relationship.js';
import type { DerivedPropertiesOnlyOf } from '../utils/derived-properties.js';

type RelationshipProperties = DerivedPropertiesOnlyOf<
  'relationship',
  'LeftSide' | 'RightSide' | 'ManyToOne' | 'OneToMany' | 'OneToOne' | 'ManyToMany'
>;

export interface Relationship<E extends Entity = Entity> extends BaseRelationship, RelationshipProperties {
  propertyName: string;
  relationshipNameCapitalized: string;

  otherEntity: E;
  otherRelationship: Relationship<Omit<Entity, 'relationships'>>;

  collection: boolean;
  skipClient?: boolean;
  skipServer?: boolean;
  /**
   * A persistable relationship means that the relationship will be updated in the database.
   */
  persistableRelationship: boolean;

  id?: boolean;
  ownerSide?: boolean;
  relationshipEagerLoad?: boolean;

  propertyJavaBeanName?: string;
  propertyDtoJavaType?: string;

  onDelete?: boolean;
  onUpdate?: boolean;

  /* TODO check motivation */
  relationshipSqlSafeName?: string;
}
