import { type Config as BaseConfig, type Features as BaseFeatures, type Options as BaseOptions } from '../base/index.js';
import type packageJson from '../../package.json';
import type { WriteContext } from '../base-core/types.js';

export type { Source } from '../base/types.js';

export type Application = WriteContext & {
  jhipsterVersion: string;
  baseName: string;
  capitalizedBaseName: string;
  dasherizedBaseName: string;
  humanizedBaseName: string;
  camelizedBaseName: string;
  hipster: string;
  lowercaseBaseName: string;
  upperFirstCamelCaseBaseName: string;
  documentationArchiveUrl: string;

  projectVersion: string;
  projectDescription: string;

  skipJhipsterDependencies: boolean;

  nodeVersion: string;
  nodePackageManager: string;
  nodeDependencies: Record<string, string>;

  jhipsterPackageJson: typeof packageJson;
};

export type Config = BaseConfig & {
  baseName?: string;
};

export type Options = BaseOptions;

export type Features = BaseFeatures;
