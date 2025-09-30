import type { Entity } from '../../../jhipster/types/entity.ts';
import type { Field } from '../../../jhipster/types/field.ts';
import type { Relationship } from '../../../jhipster/types/relationship.ts';

export type JSONField = Field & Record<string, any>;

export type JSONRelationship = Relationship & Record<string, any>;

export type JSONEntity = Entity<JSONField, JSONRelationship> & Record<string, any>;
