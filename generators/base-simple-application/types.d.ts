import type BaseCoreGenerator from '../base-core/generator.ts';
import { type BaseConfig as BaseConfig, type BaseFeatures as BaseFeatures, type BaseOptions as BaseOptions } from '../base/index.js';
import type packageJson from '../../package.json';
import type { BaseSource } from '../base/types.js';

export type BaseSimpleApplicationSource = BaseSource;

export type BaseSimpleApplicationApplication = {
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

  /** Customize templates sourceFile and destinationFile */
  customizeTemplatePaths: ((
    this: BaseCoreGenerator,
    file: {
      namespace: string;
      sourceFile: string;
      resolvedSourceFile: string;
      destinationFile: string;
      templatesRoots: string[];
    },
    context: any,
  ) => undefined | { sourceFile: string; resolvedSourceFile: string; destinationFile: string; templatesRoots: string[] })[];
};

export type BaseSimpleApplicationConfig = BaseConfig & {
  baseName?: string;
};

export type BaseSimpleApplicationOptions = BaseOptions;

export type BaseSimpleApplicationFeatures = BaseFeatures;
