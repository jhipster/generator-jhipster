import type EnvironmentBuilder from '../../cli/environment-builder.ts';
import type { CommandTypeMap } from '../../lib/command/types.ts';
import type { ApplicationType } from '../../lib/core/application-types.ts';
import type { Config as CoreConfig, Options as CoreOptions } from '../base-core/types.ts';

import type command from './command.ts';

export type { Features } from '../base-core/types.ts';

type Command = CommandTypeMap<typeof command>;

type JdlOptions = {
  baseName?: string;
  applicationType?: ApplicationType;
  projectVersion?: string;
};

export type Config = CoreConfig & JdlOptions & Command['Config'];

export type Options = CoreOptions &
  JdlOptions &
  Command['Options'] & {
    /** Builds the environment each application of a workspace is generated in, the default builder of the cli when not given. */
    createEnvBuilder?: typeof EnvironmentBuilder.createDefaultBuilder;
    /** Generates reproducible applications, given to the generators of the applications. */
    reproducible?: boolean;
    /** Disables the blueprints of the applications, given to their environments. */
    disableBlueprints?: boolean;
  };
