import type { BaseApplicationEntity } from '../../../generators/base-application/types.js';
import type { Field } from './field.js';
import type { Relationship } from './relationship.js';

type MicroserviceEntity = {
  databaseType?: string;
};

export type Entity<F extends Field = Field, R extends Relationship = Relationship> = BaseApplicationEntity<F, R> &
  MicroserviceEntity & {
    changelogDate?: string;

    entitySuffix?: string;

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

    jpaMetamodelFiltering?: boolean;

    angularJSSuffix?: string;
  };
