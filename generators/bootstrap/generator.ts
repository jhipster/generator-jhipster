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
import { rm } from 'node:fs/promises';

import { createConflicterTransform, createYoResolveTransform, forceYoFiles } from '@yeoman/conflicter';
import { transform } from '@yeoman/transform';
import type { FileTransform, PipelineOptions } from 'mem-fs';
import type { MemFsEditorFile, VinylMemFsEditorFile } from 'mem-fs-editor';
import { isFilePending, isFileStateModified } from 'mem-fs-editor/state';
import { createCommitTransform } from 'mem-fs-editor/transform';
import type { Options as PrettierOptions } from 'prettier';
import type { GeneratorPipelineOptions } from 'yeoman-generator';

import { isWin32 } from '../../lib/utils/index.ts';
import BaseGenerator, { CommandBaseGenerator } from '../base/index.ts';
import type { Features as BaseFeatures, Options as BaseOptions } from '../base/types.d.ts';
import { PRIORITY_NAMES, QUEUES } from '../base-application/priorities.ts';
import { createNeedleTransform } from '../base-core/support/needles.ts';
import { PRETTIER_EXTENSIONS } from '../generator-constants.ts';

import type command from './command.ts';
import {
  autoCrlfTransform,
  createESLintTransform,
  createForceWriteConfigFilesTransform,
  createMultiStepTransform,
  createPrettierTransform,
  createSortConfigFilesTransform,
  isGitConfigFilePath,
  isPrettierConfigFilePath,
} from './support/index.ts';

const { MULTISTEP_TRANSFORM, PRE_CONFLICTS } = PRIORITY_NAMES;
const { MULTISTEP_TRANSFORM_QUEUE, PRE_CONFLICTS_QUEUE } = QUEUES;

const MULTISTEP_TRANSFORM_PRIORITY = BaseGenerator.asPriority(MULTISTEP_TRANSFORM);
const PRE_CONFLICTS_PRIORITY = BaseGenerator.asPriority(PRE_CONFLICTS);

export default class BootstrapGenerator extends CommandBaseGenerator<typeof command> {
  static readonly MULTISTEP_TRANSFORM = MULTISTEP_TRANSFORM_PRIORITY;

  static readonly PRE_CONFLICTS = PRE_CONFLICTS_PRIORITY;

  upgradeCommand?: boolean;
  skipPrettier?: boolean;
  skipEslint?: boolean;
  prettierExtensions: string[] = PRETTIER_EXTENSIONS.split(',');
  prettierJava = false;
  prettierOptions: PrettierOptions = { plugins: [] };
  refreshOnCommit = false;
  // TODO: This feature is project-specific; it depends on https://github.com/SBoudrias/mem-fs/issues/67 being implemented so we can add a transform to remove needles based on file metadata.
  // Metadata should be set on the writeFiles API based on the application.removeNeedles config.
  /** @experimental This should be dropped if a meta-based transform is implemented */
  removeNeedles = false;

  constructor(args?: string[], options?: BaseOptions, features?: BaseFeatures) {
    super(args, options, { uniqueGlobally: true, customCommitTask: () => this.commitTask(), ...features });
  }

  async beforeQueue() {
    // Force npm override later if needed
    this.env.options.nodePackageManager = 'npm';
    this.upgradeCommand = this.options.commandName === 'upgrade';

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }
  }

  get multistepTransform(): Record<string, (this: this) => unknown> {
    return {
      queueMultistepTransform() {
        this.queueMultistepTransform();
      },
    };
  }

  get [MULTISTEP_TRANSFORM_PRIORITY]() {
    return this.multistepTransform;
  }

  get preConflicts() {
    return this.asAnyTaskGroup({
      queueCommitPrettierConfig() {
        this.queueCommitPrettierConfig();
      },
    });
  }

  get [PRE_CONFLICTS_PRIORITY]() {
    return this.preConflicts;
  }

  /**
   * Queue multi step templates transform
   */
  queueMultistepTransform() {
    const multiStepTransform = createMultiStepTransform();
    const listener = (filePath: string) => {
      if (multiStepTransform.templateFileFs.isTemplate(filePath)) {
        this.env.sharedFs.removeListener('change', listener);
        this.queueMultistepTransform();
      }
    };

    this.queueTask({
      method: async () => {
        await this.pipeline(
          {
            name: 'applying multi-step templates',
            filter: file => isFileStateModified(file) && multiStepTransform.templateFileFs.isTemplate(file.path),
            refresh: true,
            resolveConflict: (current, newFile) => (isFileStateModified(current) ? current : newFile),
          },
          multiStepTransform,
        );

        this.env.sharedFs.on('change', listener);
      },
      taskName: MULTISTEP_TRANSFORM_QUEUE,
      queueName: MULTISTEP_TRANSFORM_QUEUE,
      once: true,
    });
  }

  queueCommitPrettierConfig() {
    const listener = (filePath: string): void => {
      if (isPrettierConfigFilePath(filePath)) {
        this.env.sharedFs.removeListener('change', listener);
        this.queueCommitPrettierConfig();
      }
    };

    this.queueTask({
      method: async () => {
        await this.commitPrettierConfig();
        this.env.sharedFs.on('change', listener);
      },
      taskName: 'commitPrettierConfig',
      queueName: PRE_CONFLICTS_QUEUE,
      once: true,
    });
  }

  async commitPrettierConfig() {
    await this.commitSharedFs({
      log: 'prettier configuration files committed to disk',
      filter: file => isPrettierConfigFilePath(file.path),
    });
  }

  async commitTask() {
    await this.commitSharedFs(
      { refresh: this.refreshOnCommit },
      ...this.env.findFeature('commitTransformFactory').flatMap(({ feature }) => feature()),
    );
  }

  /**
   * Commits the MemFs to the disc.
   */
  async commitSharedFs(
    { log, ...options }: PipelineOptions<MemFsEditorFile> & { log?: string } = {},
    ...transforms: FileTransform<MemFsEditorFile>[]
  ) {
    const { autoCrlf = isWin32, devBlueprintEnabled, removeNeedles, skipYoResolve } = this.options;
    const pipelineOptions: GeneratorPipelineOptions = {
      refresh: false,
      // Let pending files pass through.
      pendingFiles: false,
      ...options,
      // Disable progress since it blocks stdin.
      disabled: true,
    };

    let customizeActions: NonNullable<Parameters<typeof createConflicterTransform>[1]>['customizeActions'];
    if (devBlueprintEnabled) {
      customizeActions = (actions, { separator }) => {
        return [
          ...(actions as any),
          ...(separator ? [separator()] : []),
          {
            key: 't',
            name: 'apply to template',
            value: async ({ file }) => {
              const { applyChangesToFileOrCopy } = await import('../../lib/ci/apply-patch-to-template.ts');

              if ((file as VinylMemFsEditorFile).history?.[0] && file.conflicterData?.diskContents) {
                const templateFile = (file as VinylMemFsEditorFile).history[0];
                if (file.contents) {
                  const oldFileContents = file.conflicterData.diskContents.toString();
                  const newFileContents = file.contents.toString();

                  applyChangesToFileOrCopy({ templateFile, oldFileContents, newFileContents });
                } else {
                  await rm(templateFile, { force: true });
                }
              }

              return 'skip';
            },
          },
        ];
      };
    }

    const createTransformStreams = async () => {
      const transformStreams: FileTransform<MemFsEditorFile>[] = [];
      if (!skipYoResolve) {
        transformStreams.push(createYoResolveTransform());
      }

      transformStreams.push(forceYoFiles(), createSortConfigFilesTransform(), createForceWriteConfigFilesTransform());

      if (removeNeedles) {
        transformStreams.push(createNeedleTransform());
      }

      if (!this.skipPrettier) {
        const ignoreErrors = this.options.ignoreErrors || this.upgradeCommand;
        if (!this.skipEslint) {
          transformStreams.push(await createESLintTransform.call(this, { ignoreErrors, cwd: this.destinationPath() }));
        }
        transformStreams.push(
          await createPrettierTransform.call(this, {
            ignoreErrors,
            prettierPackageJson: true,
            prettierJava: this.prettierJava,
            extensions: this.prettierExtensions.join(','),
            prettierOptions: this.prettierOptions,
          }),
        );
      }

      if (autoCrlf) {
        transformStreams.push(await autoCrlfTransform({ baseDir: this.destinationPath() }));
      }

      transformStreams.push(
        createConflicterTransform(this.env.adapter, { ...this.env.conflicterOptions, customizeActions }),
        createCommitTransform(),
      );

      return transformStreams;
    };

    if (autoCrlf) {
      this.log.info('autoCrlf is enabled, line endings will be detected and normalized');
      await this.pipeline(
        {
          ...pipelineOptions,
          filter: file => isGitConfigFilePath(file.path),
        },
        ...transforms,
        // Filter out pending files.
        transform((file: MemFsEditorFile) => (isFilePending(file) ? file : undefined)),
        ...(await createTransformStreams()),
      );
    }

    await this.pipeline(
      pipelineOptions,
      ...transforms,
      // Filter out pending files.
      transform((file: MemFsEditorFile) => (isFilePending(file) ? file : undefined)),
      ...(await createTransformStreams()),
    );
    this.log.ok(log ?? 'files committed to disk');
  }
}
