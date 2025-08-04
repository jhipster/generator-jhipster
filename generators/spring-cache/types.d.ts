import type { HandleCommandTypes } from '../../lib/command/types.ts';
import type { Entity as BaseApplicationEntity } from '../base-application/types.d.ts';
import type {
  Application as SpringBootApplication,
  Config as SpringBootConfig,
  Entity as SpringBootEntity,
  Options as SpringBootOptions,
  Source as SpringBootSource,
} from '../spring-boot/types.d.ts';

import type command from './command.ts';

export type Source = SpringBootSource & {
  addEntryToCache?(entry: { entry: string }): void;
  addEntityToCache?(entry: { entityAbsoluteClass: string; relationships?: { propertyName: string; collection: boolean }[] }): void;
};

type Command = HandleCommandTypes<typeof command>;

export { SpringBootEntity as Entity };

export type Config = SpringBootConfig & Command['Config'];

export type Application<E extends BaseApplicationEntity = SpringBootEntity> = SpringBootApplication<E> & Command['Application'];

export type Options = SpringBootOptions & Command['Options'];
