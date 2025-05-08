/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand } from '../../command/types.js';
import type { YO_RC_CONFIG_KEY } from '../../utils/yo-rc.ts';
import { BaseApplicationConfiguration } from '../../../generators/base-application/api.js';

type BaseApplicationConfig = BaseApplicationConfiguration & {
  entities?: string[];
  backendType?: string;
  projectDescription?: string;
};

export type ApplicationConfiguration = Simplify<
  {
    jhipsterVersion?: string;
    baseName: string;
    creationTimestamp?: string;
    lastLiquibaseTimestamp?: number;
    blueprints?: { name: string; version?: string }[];
    testFrameworks?: string[];
    microfrontends?: { baseName: string }[];
    skipCommitHook?: boolean;
    skipGit?: boolean;
    appsFolders?: string[];
    packages?: string[];
  } & BaseApplicationConfig &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/app/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/bootstrap-application-base/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/client/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/git/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/bootstrap/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/build-tool/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/graalvm/command.ts').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/javascript/generators/bootstrap/command.js').default> &
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
export type WorkspaceConfiguration = ApplicationConfiguration & {
  adminPassword?: string;
  deploymentType?: string;
} & Simplify<
    {
      directoryPath?: string;
    } & ExportGeneratorOptionsFromCommand<typeof import('../../../generators/workspaces/command.js').default> &
      ExportStoragePropertiesFromCommand<typeof import('../../../generators/base-workspaces/command.js').default>
  >;
export type YoRcContent<Content = ApplicationConfiguration> = Record<typeof YO_RC_CONFIG_KEY, Content>;
