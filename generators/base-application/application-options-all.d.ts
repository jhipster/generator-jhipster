/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportGeneratorOptionsFromCommand } from '../../lib/command/types.js';
import type { Options as JavascriptOptions } from '../javascript/types.d.ts';

export type ApplicationOptions = Simplify<
  JavascriptOptions &
    ExportGeneratorOptionsFromCommand<typeof import('../app/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../base/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../bootstrap-application-base/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../client/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../git/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../java/generators/bootstrap/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../java/generators/build-tool/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../java/generators/graalvm/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../jdl/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../languages/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../liquibase/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../project-name/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../server/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../spring-boot/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../spring-cloud/generators/gateway/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../spring-data-relational/command.ts').default>
>;
