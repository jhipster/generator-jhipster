import type { Field as SpringDataRelationalField } from '../../generators/spring-data-relational/index.js';
import type { Field as LiquibaseField } from '../../generators/liquibase/index.js';
import type { Field as ClientField } from '../../generators/client/index.js';

export type FieldAll = SpringDataRelationalField & LiquibaseField & ClientField;
