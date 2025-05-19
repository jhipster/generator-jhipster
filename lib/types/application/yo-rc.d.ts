/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportStoragePropertiesFromCommand } from '../../command/types.js';
import type { YO_RC_CONFIG_KEY } from '../../utils/yo-rc.ts';
import type { Config } from '../../../generators/base-core/types.js';

type BaseApplicationConfig = {
  entities?: string[];
  backendType?: string;
  projectDescription?: string;
};

export type ApplicationConfiguration = Simplify<
  BaseApplicationConfig &
    Config & {
      baseName: string;
      applicationIndex?: number;
      creationTimestamp?: number;
      testFrameworks?: string[];
      microfrontends?: { baseName: string }[];
    } & ExportStoragePropertiesFromCommand<typeof import('../../../generators/app/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/base/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/bootstrap-application-base/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/client/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/git/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/bootstrap/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/build-tool/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/graalvm/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/javascript/generators/bootstrap/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/javascript/generators/husky/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/javascript/generators/prettier/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/jdl/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/languages/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/liquibase/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/project-name/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/server/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/spring-boot/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/spring-cloud/generators/gateway/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/spring-data-relational/command.js').default>
>;

export type YoRcContent<Content = ApplicationConfiguration> = Record<typeof YO_RC_CONFIG_KEY, Content>;
