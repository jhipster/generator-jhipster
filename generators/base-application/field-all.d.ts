import type { Field as SpringDataRelationalField } from '../spring-data-relational/index.js';
import type { Field as LiquibaseField } from '../liquibase/index.js';
import type { Field as ClientField } from '../client/index.js';

export type FieldAll = SpringDataRelationalField & LiquibaseField & ClientField;
