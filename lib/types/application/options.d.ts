/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportGeneratorOptionsFromCommand } from '../../command/types.js';
import { InitOptions } from '../../../generators/init/types.js';
import { BootstrapApplicationBaseOptions } from '../../../generators/bootstrap-application-base/types.js';
import { LanguagesOptions } from '../../../generators/languages/types.js';

export type ApplicationOptions = Simplify<
  ExportGeneratorOptionsFromCommand<typeof import('../../../generators/app/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/base/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/bootstrap-application-base/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/client/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/git/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/java/generators/bootstrap/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/java/generators/build-tool/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/java/generators/graalvm/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/javascript/generators/bootstrap/command.js').default> &
    InitOptions &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/jdl/command.js').default> &
    LanguagesOptions &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/liquibase/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/project-name/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/server/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/spring-boot/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/spring-cloud/generators/gateway/command.js').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../../generators/spring-data-relational/command.js').default>
>;

export type JHipsterGeneratorOptions = BootstrapApplicationBaseOptions &
  ApplicationOptions & {
    /* generate-blueprint options */
    localBlueprint?: boolean;

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
