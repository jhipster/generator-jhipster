import type { Entity } from '../../../jhipster/types/entity.js';
import type { Field } from '../../../jhipster/types/field.js';
import type { Relationship } from '../../../jhipster/types/relationship.js';

export type JSONField = Field & Record<string, any>;

export type JSONRelationship = Relationship & Record<string, any>;

export type JSONEntity = Entity<JSONField, JSONRelationship> & Record<string, any>;
