import type { Field as SpringDataRelationalField } from '../../generators/spring-data-relational/types.d.ts';
import type { Field as LiquibaseField } from '../../generators/liquibase/types.d.ts';
import type { Field as ClientField } from '../../generators/client/types.d.ts';

export type FieldAll = SpringDataRelationalField &
  LiquibaseField &
  ClientField & {
    derivedPath?: string[];
    dynamic?: boolean;
  };
