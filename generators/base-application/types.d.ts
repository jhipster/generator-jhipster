import type {
  Config as BaseConfig,
  Features as BaseFeatures,
  Options as BaseOptions,
  Application as SimpleApplication,
} from '../base-simple-application/index.ts';
import type { ApplicationOptions } from './application-options-all.js';

export type Config = BaseConfig & {
  baseName?: string;
  entities?: string[];
};

export type Options = BaseOptions & ApplicationOptions;

export type Features = BaseFeatures;

export type { Source } from '../base-simple-application/types.js';

export type Application = SimpleApplication & {
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
