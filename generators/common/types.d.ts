import type { HandleCommandTypes } from '../../lib/command/types.js';
import type {
  Application as BaseApplicationApplication,
  Config as BaseApplicationConfig,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Options as BaseApplicationOptions,
  Relationship as BaseApplicationRelationship,
  Source as BaseApplicationSource,
} from '../base-application/types.js';
import type command from './command.ts';

type Command = HandleCommandTypes<typeof command>;

export type Config = BaseApplicationConfig &
  Command['Config'] & {
    applicationIndex?: number;
    testFrameworks?: string[];
  };

export type Options = BaseApplicationOptions & Command['Options'];

export type Application<E extends BaseApplicationEntity = BaseApplicationEntity> = BaseApplicationApplication<E> & Command['Application'];

export type {
  BaseApplicationEntity as Entity,
  BaseApplicationField as Field,
  BaseApplicationRelationship as Relationship,
  BaseApplicationSource as Source,
};
