import type { Source as ClientSource } from '../../generators/client/types.ts';
import type { Source as DockerSource } from '../../generators/docker/types.ts';
import type { Source as LanguagesSource } from '../../generators/languages/types.ts';
import type { Source as LiquibaseSource } from '../../generators/liquibase/types.d.ts';
import type { Source as SpringBootSource } from '../../generators/spring-boot/types.d.ts';

export type SourceAll = LiquibaseSource & SpringBootSource & ClientSource & LanguagesSource & DockerSource;
