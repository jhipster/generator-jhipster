import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

type MicroserviceEntity = {
  databaseType?: string;
};

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = MicroserviceEntity & {
  name: string;
  changelogDate?: string;
  dto?: string;
  documentation?: string;

  fields?: F[];
  relationships?: R[];

  readOnly?: boolean;
  embedded?: boolean;
  skipClient?: boolean;
  skipServer?: boolean;

  microserviceName?: string;
};
