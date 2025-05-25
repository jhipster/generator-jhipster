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
import { rm } from 'fs/promises';
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
import type { GenericTaskGroup, TaskParamWithControl } from '../base/tasks.js';
import type { BaseApplicationFeatures } from '../base-application/api.js';
import type { JHipsterGeneratorOptions } from '../../lib/types/application/options.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType, DeprecatedBaseApplicationSource } from '../../lib/types/application/application.js';
import type { ApplicationConfiguration } from '../../lib/types/application/yo-rc.js';
import type { TaskTypes as DefaultTaskTypes } from '../base-application/tasks.js';
import type { DeprecatedControl } from '../../lib/types/application/control.js';
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

export default class BootstrapGenerator<
  // FIXME For the ones that are trying to fix the types, remove the equals and look at the consequences
  Options extends JHipsterGeneratorOptions = JHipsterGeneratorOptions,
  Field extends DeprecatedField = DeprecatedField,
  PK extends DeprecatedPrimarykey<Field> = DeprecatedPrimarykey<Field>,
  Relationship extends DeprecatedRelationship<any> = DeprecatedRelationship<any>,
  Entity extends DeprecatedEntity<Field, PK, Relationship> = DeprecatedEntity<Field, PK, Relationship>,
  Application extends ApplicationType<Field, PK, Relationship> = ApplicationType<Field, PK, Relationship>,
  Sources extends DeprecatedBaseApplicationSource<Field, Relationship, Application> = DeprecatedBaseApplicationSource<
    Field,
    Relationship,
    Application
  >,
  Control extends DeprecatedControl = DeprecatedControl,
  TaskTypes extends DefaultTaskTypes<Field, PK, Relationship, Entity, Application, Sources, Control> = DefaultTaskTypes<
    Field,
    PK,
    Relationship,
    Entity,
    Application,
    Sources,
    Control
  >,
  Configuration extends ApplicationConfiguration = ApplicationConfiguration,
  Features extends BaseApplicationFeatures = BaseApplicationFeatures,
> extends BaseGenerator<Options, Entity, Application, Sources, Control, TaskTypes, Configuration, Features> {
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
    super(args, options, { uniqueGlobally: true, customCommitTask: () => this.commitTask(), ...features });
  }

  async beforeQueue() {
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

  get preConflicts(): GenericTaskGroup<this, TaskParamWithControl<Control>> {
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
    if (this.jhipsterConfigWithDefaults.autoCrlf) {
      autoCrlfTransforms.push(await autoCrlfTransform({ baseDir: this.destinationPath() }));
    }

    let customizeActions;
    if (this.options.devBlueprintEnabled) {
      customizeActions = (actions, { separator }) => {
        return [
          ...actions,
          ...(separator ? [separator()] : []),
          {
            key: 't',
            name: 'apply to template',
            value: async ({ file }) => {
              const { applyChangesToFileOrCopy } = await import('../../lib/testing/apply-patch-to-template.js');

              if (file.history?.[0] && file.conflicterData?.diskContents) {
                const templateFile = file.history[0];
                if (!file.contents) {
                  await rm(templateFile, { force: true });
                } else {
                  const oldFileContents = file.conflicterData.diskContents.toString();
                  const newFileContents = file.contents.toString();

                  applyChangesToFileOrCopy({ templateFile, oldFileContents, newFileContents });
                }
              }

              return 'skip';
            },
          },
        ];
      };
    }

    const transformStreams = [
      ...skipYoResolveTransforms,
      forceYoFiles(),
      createSortConfigFilesTransform(),
      createForceWriteConfigFilesTransform(),
      ...prettierTransforms,
      ...autoCrlfTransforms,
      createConflicterTransform(this.env.adapter, { ...(this.env as any).conflicterOptions, customizeActions }),
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
