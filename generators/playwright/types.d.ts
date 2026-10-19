import type { CommandTypeMap } from '../../lib/command/index.ts';
import type {
  Application as JavascriptApplication,
  Config as JavascriptConfig,
  Entity as JavascriptEntity,
  Options as JavascriptOptions,
} from '../client/types.ts';
import type { E2eAddedApplicationProperties } from '../e2e/application.ts';
import type { E2eAddedEntityProperties } from '../e2e/types.ts';

export type { Features, Field, Relationship, Source } from '../client/types.ts';
import type command from './command.ts';

type Command = CommandTypeMap<typeof command>;

export type Config = JavascriptConfig & Command['Config'];

export type Options = JavascriptOptions & Command['Options'];

export interface Entity extends JavascriptEntity, E2eAddedEntityProperties {
  generateEntityPlaywright?: boolean;
}

export type Application<E extends Entity = Entity> = JavascriptApplication<E> &
  Command['Application'] &
  E2eAddedApplicationProperties & {
    playwrightDir: string;
    playwrightTemporaryDir: string;
    playwrightBootstrapEntities: boolean;
  };
