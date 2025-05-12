/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportGeneratorOptionsFromCommand, JHipsterConfigs } from '../../command/types.js';
import { ApplicationWithConfig, BaseOptions } from '../../../generators/base/api.js';
import type { JDLApplicationConfig } from '../../jdl/core/types/parsing.js';

export type ApplicationOptions = BaseOptions &
  Simplify<
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/app/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/bootstrap-application-base/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/client/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/git/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/java/generators/bootstrap/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/java/generators/build-tool/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/java/generators/graalvm/command.ts').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/javascript/generators/bootstrap/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/javascript/generators/prettier/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/jdl/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/languages/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/liquibase/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/project-name/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/server/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/spring-boot/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/spring-cloud/generators/gateway/command.js').default> &
      ExportGeneratorOptionsFromCommand<typeof import('../../../generators/spring-data-relational/command.js').default>
  >;

export type JHipsterGeneratorOptions = ApplicationOptions & {
  /* cli options */
  commandName: string;
  programName: string;
  createEnvBuilder?: any;
  devBlueprintEnabled?: boolean;

  /** @experimental */
  jdlDefinition?: JDLApplicationConfig;
  /** @experimental */
  commandsConfigs?: JHipsterConfigs;

  /* yeoman options */
  skipYoResolve?: boolean;
  force?: boolean;

  /* base options */
  applicationWithConfig?: ApplicationWithConfig;

  /** boostrap options */
  applyDefaults?: <const data = any>(data: data) => data;

  /* generate-blueprint options */
  localBlueprint?: boolean;

  /* jdl generator options */
  jdlFile?: string;

  /* application options */
  db?: string;

  /* workspaces options */
  generateApplications?: boolean;
  generateWorkspaces?: boolean;
  generateWith?: string;
  monorepository?: boolean;
  workspaces?: boolean;
  workspacesFolders?: string[];
};
