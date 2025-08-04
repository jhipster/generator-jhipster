import type { Field } from './field.ts';
import type { Relationship } from './relationship.ts';

type MicroserviceEntity = {
  // Required to define the entity id type.
  databaseType?: string;
  // Some features requires backend reactive information like some cypress adjustments related to incompatible implementations.
  reactive?: boolean;
  // Some databases have different bahavior in cypress tests.
  prodDatabaseType?: string;
  // Workaround different paths?
  clientFramework?: string;
  searchEngine?: string;
};

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = MicroserviceEntity & {
  name: string;
  changelogDate?: string;
  dto?: 'no' | 'mapstruct' | 'any';
  entitySuffix?: string;
  service?: 'no' | 'serviceClass' | 'serviceImpl';
  documentation?: string;
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
