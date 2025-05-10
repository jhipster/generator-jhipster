import type { BaseFeatures, BaseOptions } from 'yeoman-generator';
import type CoreGenerator from './generator.js';
import type { CoreApplication, WriteFileBlock, WriteFileSection, WriteFileTemplate } from './types.js';

/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export type CoreConfiguration = {
  skipFakeData: boolean;
  skipCheckLengthOfIdentifier: boolean;
  enableGradleEnterprise: boolean;
  autoCrlf: boolean;
  pages: [];
};
export type CoreOptions = BaseOptions & {
  jhipsterContext?: any;
  reproducibleTests?: boolean;
  skipPriorities?: string[];
  positionalArguments?: unknown[];
  applicationId?: string;
  ignoreNeedlesError?: boolean;
  sharedData: any;
};
export type CoreFeatures = BaseFeatures & {
  jhipster7Migration?: boolean | 'verbose' | 'silent';
  /**
   * Store current version at .yo-rc.json.
   * Defaults to true.
   */
  storeJHipsterVersion?: boolean;
};
export type EditFileCallback<Generator = CoreGenerator<any, any, any, any, any, any, any, any, any>> = (
  this: Generator,
  content: string,
  filePath: string,
) => string;

export type WriteFileOptions<
  DataType extends CoreApplication,
  Generator = CoreGenerator<any, any, any, DataType, any, any, any, any, any>,
> = {
  /** transforms (files processing) to be applied */
  transform?: EditFileCallback[];
  /** context to be used as template data */
  context?: any;
  /** config passed to render methods */
  renderOptions?: Record<string, object>;
  /**
   * path(s) to look for templates.
   * Single absolute path or relative path(s) between the templates folder and template path.
   */
  rootTemplatesPath?: string | string[];

  /** @experimental Customize templates sourceFile and destinationFile */
  customizeTemplatePath?: (file: {
    sourceFile: string;
    resolvedSourceFile: string;
    destinationFile: string;
  }) => undefined | { sourceFile: string; resolvedSourceFile: string; destinationFile: string };
} & (
  | {
      sections: WriteFileSection<DataType, Generator>;
    }
  | {
      /** templates to be written */
      templates: WriteFileTemplate<DataType, Generator>[];
    }
  | {
      /** blocks to be written */
      blocks: WriteFileBlock<DataType, Generator>[];
    }
);
