import type { BaseApplicationEntity } from '../../../generators/base-application/types.js';
import type { PrimaryKey } from '../application/entity.js';
import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

export type Entity<
  F extends Field = Field,
  PK extends PrimaryKey<F> = PrimaryKey<F>,
  R extends Relationship = Relationship,
> = BaseApplicationEntity<F, PK, R> & {
  documentation?: string;

  fields?: F[];
  relationships?: R[];
  annotations?: Record<string, string | boolean>;

  readOnly?: boolean;
  embedded?: boolean;
  skipClient?: boolean;
  skipFakeData?: boolean;

  microserviceName?: string;
  clientRootFolder?: string;

  jpaMetamodelFiltering?: boolean;
};
