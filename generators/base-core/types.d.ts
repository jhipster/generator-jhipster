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
import type CoreGenerator from './generator.js';

type DataCallback<Type, S, G> = Type | ((this: G, data: S) => Type);

export type WriteFileTemplate<S, G> =
  | string
  | ((this: G, data: S, filePath: string) => string)
  | {
      condition?: DataCallback<boolean, S, G>;
      /** source file */
      sourceFile?: DataCallback<string, S, G>;
      /** destination file */
      destinationFile?: DataCallback<string, S, G>;
      /** @deprecated, use sourceFile instead */
      file?: DataCallback<string, S, G>;
      /** @deprecated, use destinationFile instead */
      renameTo?: string | ((this: G, data: S, filePath: string) => string);
      /** transforms (files processing) to be applied */
      transform?: boolean | (() => string)[];
      /** binary files skips ejs render, ejs extension and file transform */
      binary?: boolean;
      /** ejs options. Refer to https://ejs.co/#docs */
      options?: Record<string, object>;
      override?: DataCallback<boolean, S, G>;
    };

export type WriteFileBlock<S, G> = {
  /** relative path were sources are placed */
  from?: ((this: G, data: S) => string) | string;
  /** relative path were the files should be written, fallbacks to from/path */
  to?: ((this: G, data: S, filePath: string) => string) | string;
  path?: ((this: G, data: S) => string) | string;
  /** generate destinationFile based on sourceFile */
  renameTo?: ((this: G, data: S, filePath: string) => string) | string;
  /** condition to enable to write the block */
  condition?: (this: G, data: S) => boolean | undefined;
  /** transforms (files processing) to be applied */
  transform?: boolean | (() => string)[];
  templates: WriteFileTemplate<S, G>[];
};

export type WriteFileSection<S, G> = Record<string, WriteFileBlock<S, G>[]>;
export type CoreEntity = {
  resetFakerSeed(suffix?: string): void;
};

export type CoreApplication<E extends CoreEntity> = {
  sharedEntities: Record<string, E>;
  customizeTemplatePaths: any[];
};
export type CoreSources<E extends CoreEntity, A extends CoreApplication<E>, G extends CoreGenerator<any, E, A, any, any, any>> = {
  customizeTemplatePath?: ((file: {
    sourceFile: string;
    resolvedSourceFile: string;
    destinationFile: string;
  }) => undefined | { sourceFile: string; resolvedSourceFile: string; destinationFile: string; templatesRoots: string[] })[];
} & (
  | {
      sections: WriteFileSection<A, G>;
    }
  | {
      /** templates to be written */
      templates: WriteFileTemplate<A, G>[];
    }
  | {
      /** blocks to be written */
      blocks: WriteFileBlock<A, G>[];
    }
);

export type CleanupArgumentType = Record<string, (string | [boolean, ...string[]])[]>;

export type CoreControl = {
  /**
   * Configure blueprints once per application.
   */
  readonly jhipsterOldVersion: string | null;
  removeFiles: (options: { removedInVersion: string } | string, ...files: string[]) => Promise<void>;
  customizeRemoveFiles: ((file: string) => string | undefined)[];
  // blueprintConfigured?: boolean;
  readonly ignoreNeedlesError?: boolean;
  readonly cleanupFiles: any;
};
