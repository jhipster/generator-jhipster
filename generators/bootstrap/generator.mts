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
import pTransform from 'p-transform';
import { stat } from 'fs/promises';
import { isBinaryFile } from 'isbinaryfile';

import BaseGenerator from '../base/index.mjs';
import MultiStepTransform from './multi-step-transform/index.mjs';
import { prettierTransform, generatedAnnotationTransform } from './transforms.mjs';
import constants from '../generator-constants.js';
import { GENERATOR_UPGRADE } from '../generator-list.mjs';
import generatorUtils from '../utils.js';

import entityUtils from '../../utils/entity.js';
import fieldUtils from '../../utils/field.js';
import liquibaseUtils from '../../utils/liquibase.js';
import userUtils from '../../utils/user.js';
import fieldTypes from '../../jdl/jhipster/field-types.js';
import authenticationTypes from '../../jdl/jhipster/authentication-types.js';
import type { LoadingTaskGroup, PreConflictsTaskGroup } from '../base/tasks.js';

const {
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  createYoRcTransform: createForceYoRcTransform,
  createYoResolveTransform: createApplyYoResolveTransform,
  patternFilter,
  patternSpy,
} = environmentTransfrom;
const { transform } = pTransform;

const { State } = memFsEditor as any;
const { hasState, setModifiedFileState } = State;
const { PRETTIER_EXTENSIONS } = constants;
const { detectCrLf, normalizeLineEndings } = generatorUtils;

const { formatDateForChangelog, prepareFieldForLiquibaseTemplates } = liquibaseUtils;
const { prepareEntityForTemplates, prepareEntityServerForTemplates, prepareEntityPrimaryKeyForTemplates } = entityUtils;
const { prepareFieldForTemplates } = fieldUtils;
const { createUserEntity } = userUtils;
const { OAUTH2 } = authenticationTypes.default;
const { CommonDBTypes } = fieldTypes.default;

const { LONG: TYPE_LONG } = CommonDBTypes;

export default class BootstrapGenerator extends BaseGenerator {
  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', customCommitTask: true, ...features });

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

    this.queueMultistepTransform();
  }

  get loading(): LoadingTaskGroup<this> {
    return {
      createUserManagementEntities() {
        // TODO v8 drop, executed by bootstrap-base.
        this.createUserManagementEntities();
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.loading;
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

  get [BaseGenerator.PRE_CONFLICTS]() {
    return this.preConflicts;
  }

  /**
   * Queue multi step templates transform
   */
  queueMultistepTransform() {
    this.queueTransformStream(new MultiStepTransform() as any);
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

  /**
   * @private
   * @deprecated
   */
  createUserManagementEntities() {
    this.configOptions.sharedLiquibaseFakeData = this.configOptions.sharedLiquibaseFakeData || {};

    if (
      this.configOptions.sharedEntities.User ||
      (this.jhipsterConfig.skipUserManagement && this.jhipsterConfig.authenticationType !== OAUTH2)
    ) {
      return;
    }

    const changelogDateDate = this.jhipsterConfig.creationTimestamp ? new Date(this.jhipsterConfig.creationTimestamp) : new Date();
    const changelogDate = formatDateForChangelog(changelogDateDate);

    const application = this._.defaults({}, this.jhipsterConfig, this.jhipsterDefaults);
    const user: any = createUserEntity.call(this, { changelogDate }, application);

    prepareEntityForTemplates(user, this, application);
    prepareEntityServerForTemplates(user);
    prepareEntityPrimaryKeyForTemplates(user, this);

    user.fields.forEach((field: any) => {
      prepareFieldForTemplates(user, field, this);
      prepareFieldForLiquibaseTemplates(user, field);
    });
    this.configOptions.sharedEntities.User = user;

    const oauth2 = user.authenticationType === OAUTH2;
    const userIdType = user.primaryKey.type;
    const liquibaseFakeData = oauth2
      ? []
      : [
          { id: userIdType === TYPE_LONG ? 1 : user.primaryKey.fields[0].generateFakeData() },
          { id: userIdType === TYPE_LONG ? 2 : user.primaryKey.fields[0].generateFakeData() },
        ];
    user.liquibaseFakeData = liquibaseFakeData;
    user.fakeDataCount = liquibaseFakeData.length;
    this.configOptions.sharedLiquibaseFakeData.User = liquibaseFakeData;
  }
}
