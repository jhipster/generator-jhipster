import type { Application as JavaApplication, Entity as JavaEntity } from '../java/index.ts';
import type {
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Options as BaseApplicationOptions,
} from '../base-application/index.js';
import type { HandleCommandTypes } from '../../lib/command/types.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export { JavaEntity as Entity };

export type Config = BaseApplicationConfig & Command['Config'];

export type Application<E extends BaseApplicationEntity = JavaEntity> = JavaApplication<E> & Command['Application'];

export type Options = BaseApplicationOptions & Command['Options'];
