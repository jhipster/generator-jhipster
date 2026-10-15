/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, normalize } from 'node:path';

import type { VinylMemFsEditorFile } from 'mem-fs-editor';
import { isFileStateModified } from 'mem-fs-editor/state';
import { Minimatch } from 'minimatch';
import { passthrough } from 'p-transform';
import { Piscina } from 'piscina';

import { isDistFolder } from '../../../lib/index.ts';
import type CoreGenerator from '../../base-core/index.ts';
import { esmWorkerPoolOptions } from '../internal/worker-pool.ts';

import type prettierWorker from './prettier-worker.ts';
import type { PrettierFormatTask } from './prettier-worker.ts';

const prettierConfigMatch = new Minimatch('**/{.prettierrc**,.prettierignore}');
export const isPrettierConfigFilePath = (filePath: string) => prettierConfigMatch.match(filePath);

// Config files prettier reads as data; js/ts config files would be executed.
const prettierDataConfigMatch = new Minimatch('**/.prettierrc{,.json,.json5,.yaml,.yml,.toml}', { dot: true });

/**
 * Prettier resolves its config from the disk only. The prettier config files pending in the mem-fs (not committed to
 * disk, like when exporting the application) are written to a temporary folder, at their relative paths, for prettier
 * to resolve them from there.
 * Only data config files are written, and paths escaping the folder are skipped.
 * @returns the folder, or undefined when no prettier config file is pending.
 */
const writePendingPrettierConfigs = async (sharedFs?: CoreGenerator['env']['sharedFs']): Promise<string | undefined> => {
  // mem-fs files are vinyl files, the same relative path the formatted files get.
  const pendingConfigFiles = ((sharedFs?.all() ?? []) as VinylMemFsEditorFile[])
    .filter(file => file.contents && isFileStateModified(file))
    .map(file => ({ relativePath: normalize(file.relative), contents: file.contents! }))
    .filter(
      ({ relativePath }) => !isAbsolute(relativePath) && !relativePath.startsWith('..') && prettierDataConfigMatch.match(relativePath),
    );
  if (pendingConfigFiles.length === 0) {
    return undefined;
  }
  const configRoot = await mkdtemp(join(tmpdir(), 'jhipster-prettier-'));
  for (const { relativePath, contents } of pendingConfigFiles) {
    await mkdir(join(configRoot, dirname(relativePath)), { recursive: true });
    await writeFile(join(configRoot, relativePath), contents);
  }
  return configRoot;
};

const gitConfigMatch = new Minimatch('**/{.gitignore,.gitattributes}');
export const isGitConfigFilePath = (filePath: string) => gitConfigMatch.match(filePath);

const useTsFile = !isDistFolder();

/**
 * The pool of the process, created at the first file to format: its worker imports prettier and its plugins once, not
 * at each commit, and Piscina unrefs it when idle, so it doesn't keep the process alive. A commit drops what the worker
 * keeps for it, see the flush.
 */
let prettierPool: Piscina<PrettierFormatTask | { cleanup: true }, Awaited<ReturnType<typeof prettierWorker>>> | undefined;

export const createPrettierTransform = async function (
  this: CoreGenerator,
  options: Omit<PrettierFormatTask, 'relativeFilePath' | 'filePath' | 'fileContents' | 'configRoot'> & {
    ignoreErrors?: boolean;
    extensions?: string;
    /**
     * Resolve the prettier config from the config files pending in the mem-fs, for when they are not committed to disk
     * (exportApplication, deferCommit), since prettier resolves its config from the disk only.
     */
    configFromMemFs?: boolean;
  } = {},
) {
  const { ignoreErrors = false, extensions = '*', configFromMemFs = false, ...workerOptions } = options;
  // Transforms can be created before the prettier config is generated, look for pending config files when formatting.
  let configRootPromise: Promise<string | undefined> | undefined;
  const globExpression = extensions.includes(',') ? `**/*.{${extensions}}` : `**/*.${extensions}`;
  const minimatch = new Minimatch(globExpression, { dot: true });

  let pool: Piscina<Parameters<typeof prettierWorker>[0], Awaited<ReturnType<typeof prettierWorker>>> | undefined;

  return passthrough(
    async (file: VinylMemFsEditorFile) => {
      // Besides the extensions, files written with the `prettier` editor metadata are formatted too.
      if (!(minimatch.match(file.path) || file.editorMetadata?.prettier) || !isFileStateModified(file)) {
        return;
      }
      if (!file.contents) {
        throw new Error(`File content doesn't exist for ${file.relative}`);
      }
      if (configFromMemFs) {
        configRootPromise ??= writePendingPrettierConfigs(this.env.sharedFs);
      }
      pool ??= prettierPool ??= new Piscina({
        maxThreads: 1,
        ...esmWorkerPoolOptions(new URL(`./prettier-worker.${useTsFile ? 'ts' : 'js'}`, import.meta.url)),
      });
      const result = await pool.run({
        relativeFilePath: file.relative,
        filePath: file.path,
        fileContents: file.contents.toString('utf8'),
        configRoot: await configRootPromise,
        ...workerOptions,
      });
      if (result && 'result' in result) {
        file.contents = Buffer.from(result.result);
      }
      if (result && 'errorMessage' in result) {
        if (!ignoreErrors) {
          throw new Error(result.errorMessage);
        }
        this?.log?.warn?.(result.errorMessage);
      }
    },
    async () => {
      // The config files read by this commit are forgotten: the next commit of the process may change them.
      await pool?.run({ cleanup: true });
      const configRoot = await configRootPromise;
      if (configRoot) {
        await rm(configRoot, { recursive: true, force: true });
      }
    },
  );
};
