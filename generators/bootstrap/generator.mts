/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { forceYoFiles, createConflicterTransform, createYoResolveTransform } from '@yeoman/conflicter';
import { isFilePending } from 'mem-fs-editor/state';

import BaseGenerator from '../base/index.mjs';
import {
  createMultiStepTransform,
  createPrettierTransform,
  createForceWriteConfigFilesTransform,
  autoCrlfTransform,
  isPrettierConfigFilePath,
  createSortConfigFilesTransform,
  createESLintTransform,
} from './support/index.mjs';
import { PRETTIER_EXTENSIONS } from '../generator-constants.mjs';
import { GENERATOR_UPGRADE } from '../generator-list.mjs';
import { PRIORITY_NAMES, QUEUES } from '../base-application/priorities.mjs';
import type { BaseGeneratorDefinition, GenericTaskGroup } from '../base/tasks.mjs';
import command from './command.mjs';
import { createRemoveUnusedImportsTransform } from './support/java-unused-imports-transform.mjs';
import { loadStoredAppOptions } from '../app/support/index.mjs';

const { MULTISTEP_TRANSFORM, PRE_CONFLICTS } = PRIORITY_NAMES;
const { MULTISTEP_TRANSFORM_QUEUE, PRE_CONFLICTS_QUEUE } = QUEUES;

const MULTISTEP_TRANSFORM_PRIORITY = BaseGenerator.asPriority(MULTISTEP_TRANSFORM);
const PRE_CONFLICTS_PRIORITY = BaseGenerator.asPriority(PRE_CONFLICTS);

export default class BootstrapGenerator extends BaseGenerator {
  static MULTISTEP_TRANSFORM = MULTISTEP_TRANSFORM_PRIORITY;

  static PRE_CONFLICTS = PRE_CONFLICTS_PRIORITY;

  upgradeCommand?: boolean;
  skipPrettier?: boolean;

  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, uniqueGlobally: true, customCommitTask: () => this.commitSharedFs(), ...features });
  }

  beforeQueue() {
    loadStoredAppOptions.call(this);

    // Force npm override later if needed
    (this.env as any).options.nodePackageManager = 'npm';
    this.upgradeCommand = this.options.commandName === GENERATOR_UPGRADE;
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },
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
      queueTransform() {
        this.queueMultistepTransform();

        this.env.sharedFs.on('change', filePath => {
          if (createMultiStepTransform().templateFileFs.isTemplate(filePath)) {
            this.queueMultistepTransform();
          }
        });
      },
    };
  }

  get [MULTISTEP_TRANSFORM_PRIORITY]() {
    return this.multistepTransform;
  }

  get preConflicts(): GenericTaskGroup<this, BaseGeneratorDefinition['preConflictsTaskParam']> {
    return {
      async queueCommitPrettierConfig() {
        await this.queueCommitPrettierConfig();

        this.env.sharedFs.on('change', filePath => {
          if (isPrettierConfigFilePath(filePath)) {
            this.queueCommitPrettierConfig();
          }
        });
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
    this.queueTask({
      method: () => {
        const multiStepTransform = createMultiStepTransform();
        const filter = file => isFilePending(file) && multiStepTransform.templateFileFs.isTemplate(file.path);
        return this.env.applyTransforms([multiStepTransform], {
          name: 'applying multi-step templates',
          streamOptions: { filter },
        } as any);
      },
      taskName: MULTISTEP_TRANSFORM_QUEUE,
      queueName: MULTISTEP_TRANSFORM_QUEUE,
      once: true,
    });
  }

  queueCommitPrettierConfig() {
    this.queueTask({
      method: async () => {
        await this.commitPrettierConfig();
      },
      taskName: 'commitPrettierConfig',
      queueName: PRE_CONFLICTS_QUEUE,
      once: true,
    });
  }

  async commitPrettierConfig() {
    const filter = file => isFilePending(file) && isPrettierConfigFilePath(file.path);
    await this.commitSharedFs(this.env.sharedFs.stream({ filter }));
    this.log.ok('committed prettier configuration files');
  }

  /**
   * Commits the MemFs to the disc.
   * @param stream - files stream, defaults to this.sharedFs.stream().
   */
  async commitSharedFs(stream = this.env.sharedFs.stream({ filter: isFilePending })) {
    const { skipYoResolve } = this.options;
    const ignoreErrors = this.options.ignoreErrors || this.upgradeCommand;

    const transformStreams = [
      ...(skipYoResolve ? [] : [createYoResolveTransform()]),
      forceYoFiles(),
      createSortConfigFilesTransform(),
      createForceWriteConfigFilesTransform(),
      ...(this.skipPrettier
        ? []
        : [
            createESLintTransform.call(this, { ignoreErrors, extensions: 'ts,js' }),
            createRemoveUnusedImportsTransform.call(this, { ignoreErrors }),
            await createPrettierTransform.call(this, {
              ignoreErrors,
              prettierPackageJson: true,
              prettierJava: !this.jhipsterConfig.skipServer,
              extensions: PRETTIER_EXTENSIONS,
            }),
          ]),
      ...(this.jhipsterConfig.autoCrlf ? [autoCrlfTransform(this.createGit())] : []),
      createConflicterTransform(this.env.adapter, { ...(this.env as any).conflicterOptions, memFs: this.env.sharedFs }),
    ];

    await this.fs.commit(transformStreams, stream);
  }
}
