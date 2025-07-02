/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportStoragePropertiesFromCommand } from '../../lib/command/types.js';
import type { YO_RC_CONFIG_KEY } from '../../lib/utils/yo-rc.ts';
import type { Config as BaseConfig } from '../../generators/base/types.js';
import type { Config as ClientConfig } from '../../generators/client/types.js';
import type { Config as JavaConfig } from '../../generators/java/types.d.ts';
import type { Config as JavascriptConfig } from '../../generators/javascript/types.d.ts';
import type { Config as SpringCacheConfig } from '../../generators/spring-cache/index.js';
import type { Config as SpringCloudStreanConfig } from '../../generators/spring-cloud-stream/index.js';
import type { Config as BaseApplicationConfig } from '../../generators/base-application/types.js';

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
    } & ExportStoragePropertiesFromCommand<typeof import('../../generators/app/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/bootstrap-application-base/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/git/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/jdl/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/languages/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/liquibase/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/project-name/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/server/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/spring-boot/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/spring-cloud/generators/gateway/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../generators/spring-data-relational/command.ts').default>
>;

export type YoRcContent<Content = ApplicationConfiguration> = Record<typeof YO_RC_CONFIG_KEY, Content>;
