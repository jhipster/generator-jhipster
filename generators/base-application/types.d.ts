import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Options as BaseSimpleApplicationOptions,
} from '../base-simple-application/index.ts';
import type { ApplicationOptions } from './application-options-all.js';

export type Config = BaseSimpleApplicationConfig & {
  baseName?: string;
  entities?: string[];
};

export type Options = BaseSimpleApplicationOptions & ApplicationOptions;

export type { Features } from '../base-simple-application/types.js';
export type { Source } from '../base-simple-application/types.js';
export type { Control } from '../base-simple-application/types.js';

export type Application = BaseSimpleApplicationApplication & {
  jhiPrefix: string;
  jhiPrefixCapitalized: string;
  jhiPrefixDashed: string;

  entitySuffix: string;
  dtoSuffix: string;

  skipCommitHook: boolean;
  fakerSeed?: string;

  /* @deprecated use nodePackageManager */
  clientPackageManager: string;

  skipClient?: boolean;
  skipServer?: boolean;
  monorepository?: boolean;

  blueprints?: { name: string; version: string }[];
  testFrameworks?: string[];

  /**
   * True if the application has at least one non-builtin entity.
   */
  hasNonBuiltInEntity?: boolean;
};
