/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportStoragePropertiesFromCommand } from '../../command/types.js';

export type ApplicationConfiguration = Simplify<
  {
    jhipsterVersion: string;
    baseName: string;
    creationTimestamp: number;
    lastLiquibaseTimestamp?: number;
    blueprints?: { name: string }[];
    testFrameworks?: string[];
  } & ExportStoragePropertiesFromCommand<typeof import('../../../generators/app/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/base/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/bootstrap-application-base/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/client/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/bootstrap/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/java/generators/build-tool/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/javascript/generators/prettier/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/languages/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/server/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/spring-boot/command.js').default> &
    ExportStoragePropertiesFromCommand<typeof import('../../../generators/spring-data-relational/command.js').default>
>;
