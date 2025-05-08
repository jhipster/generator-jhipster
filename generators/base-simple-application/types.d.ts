import type { PackageJson } from 'type-fest';
import type CoreGenerator from '../base-core/generator.ts';
import { type Config as BaseConfig, type Features as BaseFeatures, type Options as BaseOptions } from '../base/index.js';
import type { BaseApplication } from '../base/types.js';

export type Application = BaseApplication<any> & {
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

  jhipsterPackageJson: PackageJson;

  /** Customize templates sourceFile and destinationFile */
  customizeTemplatePaths: ((
    this: CoreGenerator<any, any, any, any, any, any>,
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

export type Config = BaseConfig & {
  baseName?: string;
};

export type Options = BaseOptions;

export type Features = BaseFeatures;
