import type { DerivedPropertiesOnlyOf } from '../utils/derived-properties.js';
import type { BaseApplicationEntity, BaseApplicationRelationship } from '../../../generators/base-application/types.js';
import type { Entity } from './entity.js';
import type { Property } from './property.js';

type RelationshipProperties = DerivedPropertiesOnlyOf<
  'relationship',
  'LeftSide' | 'RightSide' | 'ManyToOne' | 'OneToMany' | 'OneToOne' | 'ManyToMany'
>;

export interface Relationship<OE extends Omit<Required<BaseApplicationEntity<any, any, any>>, 'relationships'> = Entity<any, any, any>>
  extends BaseApplicationRelationship<OE>,
    Property,
    RelationshipProperties {
  propertyName: string;
  relationshipNameCapitalized: string;

  otherRelationship: Relationship<Omit<OE, 'relationships'>>;

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
}
