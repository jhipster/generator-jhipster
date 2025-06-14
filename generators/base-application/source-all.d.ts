import type { Source as ClientSource } from '../client/types.js';
import type { Source as DockerSource } from '../docker/types.js';
import type { LanguagesSource } from '../languages/types.js';
import type { Source as LiquibaseSource } from '../liquibase/index.js';
import type { Source as SpringBootCache } from '../spring-cache/index.js';

export type SourceAll = LiquibaseSource & SpringBootCache & ClientSource & LanguagesSource & DockerSource;
