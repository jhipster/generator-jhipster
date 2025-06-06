import type { Entity as BaseEntity } from '../../lib/types/base/entity.js';
import type { Relationship as BaseRelationship } from '../../lib/types/base/relationship.js';
import type { DerivedPropertiesOnlyOf } from '../../lib/command/types.js';
import type { Entity } from './entity-all.js';
import type { Property } from './property-all.js';

type RelationshipProperties = DerivedPropertiesOnlyOf<
  'relationship',
  'LeftSide' | 'RightSide' | 'ManyToOne' | 'OneToMany' | 'OneToOne' | 'ManyToMany'
>;

export interface Relationship<E extends BaseEntity = Entity> extends BaseRelationship, Property, RelationshipProperties {
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
