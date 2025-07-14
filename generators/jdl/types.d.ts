import type { HandleCommandTypes } from '../../lib/command/types.js';
import type { ApplicationType } from '../../lib/core/application-types.ts';
import type { Config as BaseConfig, Options as BaseOptions } from '../base/types.js';
import type command from './command.js';

type Command = HandleCommandTypes<typeof command>;

type JdlOptions = {
  baseName?: string;
  applicationType?: ApplicationType;
  projectVersion?: string;
};

export type Config = BaseConfig & JdlOptions & Command['Config'];

export type Options = BaseOptions & JdlOptions & Command['Options'];
