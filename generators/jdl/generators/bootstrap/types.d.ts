import type { CommandTypeMap } from '../../../../lib/command/types.ts';
import type { Config as BaseConfig, Options as BaseOptions } from '../../../base/types.ts';

import type command from './command.ts';

type Command = CommandTypeMap<typeof command>;

export type Config = BaseConfig & Command['Config'];

export type Options = BaseOptions & Command['Options'];
