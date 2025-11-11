import type { HandleCommandTypes } from '../../lib/command/index.ts';
import type {
  Application as JavascriptApplication,
  Config as JavascriptConfig,
  Entity as JavascriptEntity,
  Options as JavascriptOptions,
} from '../client/types.ts';

export type { Field, Relationship } from '../client/types.ts';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type Config = JavascriptConfig & Command['Config'];

export type Options = JavascriptOptions & Command['Options'];

export interface Entity extends JavascriptEntity {
  workaroundEntityCannotBeEmpty?: boolean;
  workaroundInstantReactiveMariaDB?: boolean;
}

export type Application<E extends Entity = Entity> = JavascriptApplication<E> &
  Command['Application'] & {
    cypressDir: string;
    cypressTemporaryDir: string;
    cypressBootstrapEntities: boolean;
    cypressCoverageWebpack: boolean;
  };
