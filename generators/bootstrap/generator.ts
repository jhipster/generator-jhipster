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
import { createConflicterTransform, createYoResolveTransform, forceYoFiles } from '@yeoman/conflicter';
import { transform } from '@yeoman/transform';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { isFilePending, isFileStateModified } from 'mem-fs-editor/state';
import { createCommitTransform } from 'mem-fs-editor/transform';
import type { Options as PrettierOptions } from 'prettier';
import type { FileTransform, PipelineOptions } from 'mem-fs';

import BaseGenerator from '../base/index.js';
import { PRETTIER_EXTENSIONS } from '../generator-constants.js';
import { GENERATOR_UPGRADE } from '../generator-list.js';
import { PRIORITY_NAMES, QUEUES } from '../base-application/priorities.js';
import { loadStoredAppOptions } from '../app/support/index.js';
import type { GenericTaskGroup, TaskParamWithControl } from '../../lib/types/base/tasks.js';
import {
  autoCrlfTransform,
  createESLintTransform,
  createForceWriteConfigFilesTransform,
  createMultiStepTransform,
  createPrettierTransform,
  createRemoveUnusedImportsTransform,
  createSortConfigFilesTransform,
  isPrettierConfigFilePath,
} from './support/index.js';

const { MULTISTEP_TRANSFORM, PRE_CONFLICTS } = PRIORITY_NAMES;
const { MULTISTEP_TRANSFORM_QUEUE, PRE_CONFLICTS_QUEUE } = QUEUES;

const MULTISTEP_TRANSFORM_PRIORITY = BaseGenerator.asPriority(MULTISTEP_TRANSFORM);
const PRE_CONFLICTS_PRIORITY = BaseGenerator.asPriority(PRE_CONFLICTS);

export default class BootstrapGenerator extends BaseGenerator {
  static MULTISTEP_TRANSFORM = MULTISTEP_TRANSFORM_PRIORITY;

  static PRE_CONFLICTS = PRE_CONFLICTS_PRIORITY;

  upgradeCommand?: boolean;
  skipPrettier?: boolean;
  skipEslint?: boolean;
  skipForks?: boolean;
  prettierExtensions: string[] = PRETTIER_EXTENSIONS.split(',');
  prettierOptions: PrettierOptions = { plugins: [] };
  refreshOnCommit = false;

  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, uniqueGlobally: true, customCommitTask: () => this.commitTask(), ...features });
  }

  async beforeQueue() {
    loadStoredAppOptions.call(this);

    // Force npm override later if needed
    (this.env as any).options.nodePackageManager = 'npm';
    this.upgradeCommand = this.options.commandName === GENERATOR_UPGRADE;

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      validateBlueprint() {
        if (this.jhipsterConfig.blueprints && !this.skipChecks) {
          this.jhipsterConfig.blueprints.forEach(blueprint => {
            this._checkJHipsterBlueprintVersion(blueprint.name);
            this._checkBlueprint(blueprint.name);
          });
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get multistepTransform(): Record<string, (this: this) => unknown | Promise<unknown>> {
    return {
      queueMultistepTransform() {
        this.queueMultistepTransform();
      },
    };
  }

  get [MULTISTEP_TRANSFORM_PRIORITY]() {
    return this.multistepTransform;
  }

  get preConflicts(): GenericTaskGroup<this, TaskParamWithControl> {
    return {
      queueCommitPrettierConfig() {
        this.queueCommitPrettierConfig();
      },
    };
  }

  get [PRE_CONFLICTS_PRIORITY]() {
    return this.preConflicts;
  }

  /**
   * Queue multi step templates transform
   */
  queueMultistepTransform() {
    const multiStepTransform = createMultiStepTransform();
    const listener = filePath => {
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
    const listener = filePath => {
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
      ...this.env
        .findFeature('commitTransformFactory')
        .map(({ feature }) => feature())
        .flat(),
    );
  }

  /**
   * Commits the MemFs to the disc.
   */
  async commitSharedFs(
    { log, ...options }: PipelineOptions<MemFsEditorFile> & { log?: string } = {},
    ...transforms: FileTransform<MemFsEditorFile>[]
  ) {
    const skipYoResolveTransforms: FileTransform<MemFsEditorFile>[] = [];
    if (!this.options.skipYoResolve) {
      skipYoResolveTransforms.push(createYoResolveTransform());
    }

    const prettierTransforms: FileTransform<MemFsEditorFile>[] = [];
    if (!this.skipPrettier) {
      const ignoreErrors = this.options.ignoreErrors || this.upgradeCommand;
      if (!this.skipEslint) {
        prettierTransforms.push(
          createESLintTransform.call(this, { ignoreErrors }),
          createRemoveUnusedImportsTransform.call(this, { ignoreErrors }),
        );
      }
      prettierTransforms.push(
        await createPrettierTransform.call(this, {
          ignoreErrors,
          prettierPackageJson: true,
          prettierJava: !this.jhipsterConfig.skipServer,
          extensions: this.prettierExtensions.join(','),
          prettierOptions: this.prettierOptions,
          skipForks: this.skipForks,
        }),
      );
    }

    const autoCrlfTransforms: FileTransform<MemFsEditorFile>[] = [];
    if (this.jhipsterConfig.autoCrlf) {
      autoCrlfTransforms.push(await autoCrlfTransform({ baseDir: this.destinationPath() }));
    }

    const transformStreams = [
      ...skipYoResolveTransforms,
      forceYoFiles(),
      createSortConfigFilesTransform(),
      createForceWriteConfigFilesTransform(),
      ...prettierTransforms,
      ...autoCrlfTransforms,
      createConflicterTransform(this.env.adapter, { ...(this.env as any).conflicterOptions }),
      createCommitTransform(),
    ];

    await this.pipeline(
      {
        refresh: false,
        // Let pending files pass through.
        pendingFiles: false,
        ...options,
        // Disable progress since it blocks stdin.
        disabled: true,
      },
      ...transforms,
      // Filter out pending files.
      transform((file: MemFsEditorFile) => (isFilePending(file) ? file : undefined)),
      ...transformStreams,
    );
    this.log.ok(log ?? 'files committed to disk');
  }
}
