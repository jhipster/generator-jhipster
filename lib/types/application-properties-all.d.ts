/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type { Application as ClientApplication } from '../../generators/client/types.js';
import type { Application as DockerApplication } from '../../generators/docker/types.js';
import type { Application as SpringBootApplication } from '../../generators/spring-boot/types.js';
import type { Application as SpringDataRelationalApplication } from '../../generators/spring-data-relational/types.d.ts';
import type { Application as LiqbuibaseApplication } from '../../generators/liquibase/types.d.ts';
import type { Application as I18nApplication } from '../../generators/languages/types.js';
import type { Application as SpringCacheApplication } from '../../generators/spring-cache/types.d.ts';
import type { Application as SpringCloudStreanApplication } from '../../generators/spring-cloud-stream/types.d.ts';
import type { Application as SpringCloudApplication } from '../../generators/spring-cloud/types.js';
import type { Application as BaseApplication } from '../../generators/base-application/types.js';
import type { EntityAll } from './entity-all.js';

/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type ApplicationAll<E extends EntityAll = EntityAll> = BaseApplication<E> &
  QuirksApplication &
  I18nApplication<E> &
  SpringBootApplication<E> &
  SpringDataRelationalApplication<E> &
  SpringCacheApplication<E> &
  SpringCloudStreanApplication<E> &
  SpringCloudApplication<E> &
  ClientApplication<E> &
  DockerApplication &
  LiqbuibaseApplication<E> &
  ExportApplicationPropertiesFromCommand<typeof import('../../generators/project-name/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../../generators/spring-boot/command.ts').default>;
