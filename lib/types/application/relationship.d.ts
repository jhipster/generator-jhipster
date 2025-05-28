import type { DerivedPropertiesOnlyOf } from '../utils/derived-properties.js';
import type { BaseApplicationEntity } from '../../../generators/base-application/types.js';
import type { Relationship as BaseRelationship } from '../base/relationship.js';
import type { Entity } from './entity.js';
import type { Property } from './property.js';
type RelationshipProperties = DerivedPropertiesOnlyOf<
  'relationship',
  'LeftSide' | 'RightSide' | 'ManyToOne' | 'OneToMany' | 'OneToOne' | 'ManyToMany'
>;

export interface Relationship<OE extends BaseApplicationEntity<any, any, any> = Entity<any, any, any>>
  extends BaseRelationship<OE>,
    Property,
    RelationshipProperties {
  propertyName: string;
  relationshipNameCapitalized: string;

  otherRelationship?: Relationship<OE>;

  collection: boolean;
  skipClient?: boolean;
  skipServer?: boolean;

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
  relationshipSide?: 'left' | 'right';
}
