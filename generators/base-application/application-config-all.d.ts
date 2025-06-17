/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportStoragePropertiesFromCommand } from '../../lib/command/types.js';
import type { YO_RC_CONFIG_KEY } from '../../lib/utils/yo-rc.ts';
import type { Config as BaseConfig } from '../base/types.js';
import type { Config as ClientConfig } from '../client/types.js';
import type { Config as JavaConfig } from '../java/types.d.ts';
import type { Config as JavascriptConfig } from '../javascript/types.d.ts';
import type { Config as SpringCacheConfig } from '../spring-cache/index.js';
import type { Config as SpringCloudStreanConfig } from '../spring-cloud-stream/index.js';
import type { Config as BaseApplicationConfig } from './types.js';

export type ApplicationConfiguration = Simplify<
  BaseApplicationConfig &
    ClientConfig &
    JavaConfig &
    JavascriptConfig &
    SpringCacheConfig &
    SpringCloudStreanConfig &
    BaseConfig & {
      creationTimestamp?: number;
      microfrontends?: { baseName: string }[];
    } & ExportStoragePropertiesFromCommand<typeof import('../app/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../bootstrap-application-base/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../git/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../jdl/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../languages/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../liquibase/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../project-name/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../server/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../spring-boot/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../spring-cloud/generators/gateway/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../spring-data-relational/command.ts').default>
>;

export type YoRcContent<Content = ApplicationConfiguration> = Record<typeof YO_RC_CONFIG_KEY, Content>;
