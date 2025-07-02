/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { Simplify } from 'type-fest';
import type { ExportGeneratorOptionsFromCommand } from '../../lib/command/types.js';
import type { Options as ClientOptions } from '../../generators/client/types.d.ts';
import type { Options as JavascriptOptions } from '../../generators/javascript/types.d.ts';
import type { Options as SpringCacheOptions } from '../../generators/spring-cache/index.js';
import type { Options as SpringCloudStreanOptions } from '../../generators/spring-cloud-stream/index.js';

export type ApplicationOptions = Simplify<
  JavascriptOptions &
    ClientOptions &
    SpringCacheOptions &
    SpringCloudStreanOptions &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/app/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/base/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/bootstrap-application-base/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/client/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/git/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/java/generators/bootstrap/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/java/generators/build-tool/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/java/generators/graalvm/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/jdl/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/languages/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/liquibase/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/project-name/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/server/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/spring-boot/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/spring-cloud/generators/gateway/command.ts').default> &
    ExportGeneratorOptionsFromCommand<typeof import('../../generators/spring-data-relational/command.ts').default>
>;
