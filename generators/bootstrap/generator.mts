/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import memFsEditor from 'mem-fs-editor';
import environmentTransfrom from 'yeoman-environment/transform';
import { transform } from 'p-transform';
import { stat } from 'fs/promises';
import { isBinaryFile } from 'isbinaryfile';

import type { Transform, Readable } from 'stream';
import type Environment from 'yeoman-environment';

import BaseGenerator from '../base/index.mjs';
import MultiStepTransform from './multi-step-transform/index.mjs';
import { prettierTransform, generatedAnnotationTransform } from './transforms.mjs';
import constants from '../generator-constants.cjs';
import { GENERATOR_UPGRADE } from '../generator-list.mjs';
import { PRIORITY_NAMES } from '../base-application/priorities.mjs';
import type { PreConflictsTaskGroup } from '../base/tasks.mjs';
import { detectCrLf } from './utils.mjs';
import { normalizeLineEndings } from '../base/utils.mjs';

const { TRANSFORM, PRE_CONFLICTS } = PRIORITY_NAMES;
const {
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  createYoRcTransform: createForceYoRcTransform,
  createYoResolveTransform: createApplyYoResolveTransform,
  patternFilter,
  patternSpy,
} = environmentTransfrom;

const { State } = memFsEditor as any;
const { hasState, setModifiedFileState } = State;
const { PRETTIER_EXTENSIONS } = constants;

const TRANSFORM_PRIORITY = BaseGenerator.asPriority(TRANSFORM);
const PRE_CONFLICTS_PRIORITY = BaseGenerator.asPriority(PRE_CONFLICTS);

export default class BootstrapGenerator extends BaseGenerator {
  static TRANSFORM = TRANSFORM_PRIORITY;

  static PRE_CONFLICTS = PRE_CONFLICTS_PRIORITY;

  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', uniqueGlobally: true, customCommitTask: true, ...features });

    if (this.options.help) return;

    if (!this.options.upgradeCommand) {
      const { commandName } = this.options;
      this.options.upgradeCommand = commandName === GENERATOR_UPGRADE;
    }
  }

  _postConstruct() {
    /*
     * When testing a generator with yeoman-test using 'withLocalConfig(localConfig)', it instantiates the
     * generator and then executes generator.config.defaults(localConfig).
     * JHipster workflow does a lot of configuration at the constructor, sometimes this is required due to current
     * blueprints support implementation, making it incompatible with yeoman-test's withLocalConfig.
     * 'defaultLocalConfig' option is a replacement for yeoman-test's withLocalConfig method.
     * 'defaults' function sets every key that has undefined value at current config.
     */
    if (this.options.defaultLocalConfig) {
      this.config.defaults(this.options.defaultLocalConfig);
    }
    /*
     * Option 'localConfig' uses set instead of defaults of 'defaultLocalConfig'.
     * 'set' function sets every key from 'localConfig'.
     */
    if (this.options.localConfig) {
      (this.config as any).set(this.options.localConfig);
    }

    if (this.options.help) return;

    this.loadStoredAppOptions();

    // Load common runtime options.
    this.parseCommonRuntimeOptions();

    // Force npm override later if needed
    this.env.options.nodePackageManager = 'npm';
  }

  get transform() {
    return this.asWritingTaskGroup({
      queueTransform() {
        this.queueMultistepTransform();
      },
    });
  }

  get [TRANSFORM_PRIORITY]() {
    return this.transform;
  }

  get preConflicts(): PreConflictsTaskGroup<this> {
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
      taskName: 'jhipster:transformStream',
      queueName: 'transform',
    });
  }

  /**
   * Queue environment's commit task.
   */
  queueCommit() {
    this.debug('Queueing conflicts task');
    (this as any).queueTask(
      {
        method: async () => {
          this.debug('Adding queueCommit event listener');
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

    // JDL writes directly to disk, set the file as modified so prettier will be applied
    const { upgradeCommand, ignoreErrors } = this.options;
    if (!upgradeCommand) {
      stream = stream.pipe(
        patternSpy((file: any) => {
          if (file.contents && !hasState(file) && !this.options.reproducibleTests) {
            setModifiedFileState(file);
          }
        }, '**/{.yo-rc.json,.jhipster/*.json}').name('jhipster:config-files:modify')
      );
    }

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
      const transformOptions = { ignoreErrors: ignoreErrors || upgradeCommand, extensions: PRETTIER_EXTENSIONS };
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
