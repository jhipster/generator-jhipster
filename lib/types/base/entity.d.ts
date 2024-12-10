import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

type MicroserviceEntity = {
  databaseType?: string;
};

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = MicroserviceEntity & {
  name: string;
  changelogDate?: string;
  dto?: 'no' | 'mapstruct' | 'any';
  entitySuffix?: string;
  service?: 'no' | 'serviceClass' | 'serviceImpl';
  documentation?: string;
  searchEngine?: string;
  entityPackage?: string;

  fields?: F[];
  relationships?: R[];
  annotations?: Record<string, string | boolean>;

  readOnly?: boolean;
  embedded?: boolean;
  skipClient?: boolean;
  skipServer?: boolean;
  skipFakeData?: boolean;

  microserviceName?: string;
  clientRootFolder?: string;
  pagination?: 'no' | 'infinite-scroll' | 'pagination';
  jpaMetamodelFiltering?: boolean;

  angularJSSuffix?: string;
};
