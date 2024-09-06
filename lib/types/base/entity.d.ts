import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = {
  name: string;
  changelogDate?: string;
  dto?: string;

  fields?: F[];
  relationships?: R[];

  readOnly?: boolean;
  embedded?: boolean;
  skipClient?: boolean;
  skipServer?: boolean;
};
