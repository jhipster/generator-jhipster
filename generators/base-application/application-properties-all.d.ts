/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type { Application as ClientApplication } from '../client/types.js';
import type { Application as DockerApplication } from '../docker/types.js';
import type { Application as SpringBootApplication } from '../spring-boot/types.js';
import type { Application as SpringDataRelationalApplication } from '../spring-data-relational/index.js';
import type { Application as LiqbuibaseApplication } from '../liquibase/index.js';
import type { I18nApplication } from '../languages/types.js';
import type { EntityAll } from './entity-all.js';
import type { Application as BaseApplication } from './types.js';

/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type ApplicationAll<E extends EntityAll = EntityAll> = BaseApplication<E> &
  QuirksApplication &
  I18nApplication<E> &
  SpringBootApplication<E> &
  SpringDataRelationalApplication<E> &
  ClientApplication<E> &
  DockerApplication &
  LiqbuibaseApplication<E> &
  ExportApplicationPropertiesFromCommand<typeof import('../git/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../project-name/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../spring-boot/command.ts').default>;

export { Options as AllOptions, Config as AllConfig } from './types.js';
