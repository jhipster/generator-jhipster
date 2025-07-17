import type { Source as ClientSource } from '../../generators/client/types.js';
import type { Source as DockerSource } from '../../generators/docker/types.js';
import type { Source as LanguagesSource } from '../../generators/languages/types.js';
import type { Source as LiquibaseSource } from '../../generators/liquibase/types.d.ts';
import type { Source as SpringBootCache } from '../../generators/spring-cache/types.d.ts';

export type SourceAll = LiquibaseSource & SpringBootCache & ClientSource & LanguagesSource & DockerSource;
