/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { ExportApplicationPropertiesFromCommand } from '../../lib/command/types.js';
import type { Application as ClientApplication } from '../client/types.js';
import type { SpringBootApplication } from '../server/types.js';
import type { I18nApplication } from '../languages/types.js';
import { EntityAll } from './entity-all.js';
import type { Application as BaseApplication } from './types.js';

/* AuthenticationType End */

type QuirksApplication = {
  cypressBootstrapEntities?: boolean;
};

export type ApplicationAll<E extends EntityAll = EntityAll> = BaseApplication<E> &
  QuirksApplication &
  I18nApplication<E> &
  SpringBootApplication &
  ClientApplication<E> &
  ExportApplicationPropertiesFromCommand<typeof import('../docker/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../git/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../gradle/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../project-name/command.ts').default> &
  ExportApplicationPropertiesFromCommand<typeof import('../spring-boot/command.ts').default> &
  import('../docker/types.js').DockerApplicationType;

export { Options as AllOptions, Config as AllConfig } from './types.js';
