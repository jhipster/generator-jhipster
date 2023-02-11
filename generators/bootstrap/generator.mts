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
import environmentTransfrom from 'yeoman-environment/transform';
import { transform } from 'p-transform';
import { stat } from 'fs/promises';
import { isBinaryFile } from 'isbinaryfile';

import type { Transform, Readable } from 'stream';
import type Environment from 'yeoman-environment';

import BaseGenerator from '../base/index.mjs';
import MultiStepTransform from './multi-step-transform/index.mjs';
import { prettierTransform, generatedAnnotationTransform } from './transforms.mjs';
import { PRETTIER_EXTENSIONS } from '../generator-constants.mjs';
import { GENERATOR_UPGRADE } from '../generator-list.mjs';
import { PRIORITY_NAMES, QUEUES } from '../base-application/priorities.mjs';
import type { BaseGeneratorDefinition, GenericTaskGroup } from '../base/tasks.mjs';
import { detectCrLf } from './utils.mjs';
import { normalizeLineEndings } from '../base/support/index.mjs';
import command from './command.mjs';

const { MULTISTEP_TRANSFORM, PRE_CONFLICTS } = PRIORITY_NAMES;
const { MULTISTEP_TRANSFORM_QUEUE } = QUEUES;
const {
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  createYoRcTransform: createForceYoRcTransform,
  createYoResolveTransform: createApplyYoResolveTransform,
  patternFilter,
  patternSpy,
} = environmentTransfrom;

const MULTISTEP_TRANSFORM_PRIORITY = BaseGenerator.asPriority(MULTISTEP_TRANSFORM);
const PRE_CONFLICTS_PRIORITY = BaseGenerator.asPriority(PRE_CONFLICTS);

export default class BootstrapGenerator extends BaseGenerator {
  static MULTISTEP_TRANSFORM = MULTISTEP_TRANSFORM_PRIORITY;

  static PRE_CONFLICTS = PRE_CONFLICTS_PRIORITY;

  upgradeCommand!: boolean;

  constructor(args: any, options: any, features: any) {
    super(args, options, { uniqueGlobally: true, customCommitTask: true, ...features });

    if (this.options.help) return;

    const { commandName } = this.options;
    this.upgradeCommand = commandName === GENERATOR_UPGRADE;
  }

  _postConstruct() {
    if (this.options.help) return;

    this.loadStoredAppOptions();

    // Load common runtime options.
    this.parseCommonRuntimeOptions();

    // Force npm override later if needed
    this.env.options.nodePackageManager = 'npm';
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadOptions() {
        this.parseJHipsterOptions(command.options);
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
      },
    };
  }

  get [MULTISTEP_TRANSFORM_PRIORITY]() {
    return this.multistepTransform;
  }

  get preConflicts(): GenericTaskGroup<this, BaseGeneratorDefinition['preConflictsTaskParam']> {
    return {
      async commitPrettierConfig() {
        if (this.options.skipCommit) {
          this.debug('Skipping commit prettier');
          return;
        }
        await this.commitSharedFs(this.env.sharedFs.stream().pipe(patternFilter('**/{.prettierrc**,.prettierignore}')), true);
      },
      async commitFiles() {
        if (this.options.skipCommit) {
          this.debug('Skipping commit files');
          return;
        }
        this.env.sharedFs.once('change', () => {
          this.queueMultistepTransform();
          this.queueCommit();
        });
        await this.commitSharedFs();
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
      method() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const env: Environment = (this as any).env;
        const stream = env.sharedFs.stream().pipe(patternFilter('**/*.jhi{,.*}', { dot: true })) as Readable;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return env.applyTransforms([new MultiStepTransform() as unknown as Transform], { stream } as any);
      },
      taskName: MULTISTEP_TRANSFORM_QUEUE,
      queueName: MULTISTEP_TRANSFORM_QUEUE,
      once: true,
    });
  }

  /**
   * Queue environment's commit task.
   */
  queueCommit() {
    this.logger.debug('Queueing conflicts task');
    (this as any).queueTask(
      {
        method: async () => {
          this.logger.debug('Adding queueCommit event listener');
          this.env.sharedFs.once('change', () => {
            this.queueCommit();
          });
          await this.commitSharedFs();
        },
      },
      {
        priorityName: 'conflicts',
        once: 'write memory fs to disk',
      }
    );
  }

  /**
   * Commits the MemFs to the disc.
   * @param {Stream} [stream] - files stream, defaults to this.sharedFs.stream().
   * @param {boolean} [skipPrettier]
   * @return {Promise}
   */
  async commitSharedFs(stream = this.env.sharedFs.stream(), skipPrettier = this.options.skipPrettier) {
    const { skipYoResolve } = this.options;
    const { withGeneratedFlag, autoCrlf } = this.jhipsterConfig;
    const env: any = this.env;

    const { ignoreErrors } = this.options;

    const conflicterStatus = {
      fileActions: [
        {
          key: 'i',
          name: 'ignore, do not overwrite and remember (experimental)',
          value: (file: any) => {
            const { relativeFilePath } = file;
            env.fs.append(`${this.env.cwd}/.yo-resolve`, `${relativeFilePath} skip`, { create: true });
            return 'skip';
          },
        },
      ],
    };

    const createApplyPrettierTransform = () => {
      const prettierOptions = { packageJson: true, java: !this.skipServer && !this.jhipsterConfig.skipServer };
      // Prettier is clever, it uses correct rules and correct parser according to file extension.
      const transformOptions = { ignoreErrors: ignoreErrors || this.upgradeCommand, extensions: PRETTIER_EXTENSIONS };
      return prettierTransform(prettierOptions, this, transformOptions);
    };

    const createForceWriteConfigFiles = () =>
      patternSpy((file: any) => {
        file.conflicter = 'force';
      }, '**/.jhipster/*.json').name('jhipster:config-files:force');

    const convertToCRLF = () =>
      transform(async (file: any) => {
        if (!file.contents) {
          return file;
        }
        if (await isBinaryFile(file.contents)) {
          return file;
        }
        const fstat = await stat(file.path);
        if (!fstat.isFile()) {
          return file;
        }
        const attributes = Object.fromEntries(
          (await this.createGit().raw('check-attr', 'binary', 'eol', '--', file.path))
            .split(/\r\n|\r|\n/)
            .map(attr => attr.split(':'))
            .map(([_file, attr, value]) => [attr, value])
        );
        if (attributes.binary === 'set' || attributes.eol === 'lf') {
          return file;
        }
        if (attributes.eol === 'crlf' || (await detectCrLf(file.path))) {
          file.contents = Buffer.from(normalizeLineEndings(file.contents.toString(), '\r\n'));
        }
        return file;
      }, 'jhipster:crlf');

    const transformStreams = [
      ...(skipYoResolve ? [] : [createApplyYoResolveTransform(env.conflicter)]),
      createForceYoRcTransform(),
      createForceWriteConfigFiles(),
      ...(withGeneratedFlag ? [generatedAnnotationTransform(this)] : []),
      ...(skipPrettier ? [] : [createApplyPrettierTransform()]),
      ...(autoCrlf ? [convertToCRLF()] : []),
      createConflicterCheckTransform(env.conflicter, conflicterStatus),
      createConflicterStatusTransform(),
    ];

    await env.fs.commit(transformStreams, stream);
  }
}
