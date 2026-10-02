import type EnvironmentBuilder from '../../cli/environment-builder.ts';
import type { CommandTypeMap } from '../../lib/command/types.ts';
import type { ApplicationType } from '../../lib/core/application-types.ts';
import type { Config as BaseConfig, Options as BaseOptions } from '../base/types.ts';

import type command from './command.ts';

export type { Features, Source } from '../base/types.ts';

type Command = CommandTypeMap<typeof command>;

type JdlOptions = {
  baseName?: string;
  applicationType?: ApplicationType;
  projectVersion?: string;
};

export type Config = BaseConfig & JdlOptions & Command['Config'];

export type Options = BaseOptions &
  JdlOptions &
  Command['Options'] & {
    /** Builds the environment each application of a workspace is generated in, the default builder of the cli when not given. */
    createEnvBuilder?: typeof EnvironmentBuilder.createDefaultBuilder;
  };
