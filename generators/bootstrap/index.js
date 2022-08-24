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
const { State } = require('mem-fs-editor');
const {
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  createYoRcTransform: createForceYoRcTransform,
  createYoResolveTransform: createApplyYoResolveTransform,
  patternFilter,
  patternSpy,
} = require('yeoman-environment/transform');
const { transform } = require('p-transform');
const { stat } = require('fs/promises');
const { isBinaryFile } = require('isbinaryfile');

const { hasState, setModifiedFileState } = State;

const BaseGenerator = require('../generator-base');
const { LOADING_PRIORITY, PRE_CONFLICTS_PRIORITY } = require('../../lib/constants/priorities.cjs').compat;

const { MultiStepTransform } = require('../../utils/multi-step-transform');
const { GENERATOR_UPGRADE } = require('../generator-list');
const { prettierTransform, generatedAnnotationTransform } = require('../generator-transforms');
const { formatDateForChangelog, prepareFieldForLiquibaseTemplates } = require('../../utils/liquibase');
const {
  prepareEntityForTemplates,
  prepareEntityServerDomainForTemplates,
  prepareEntityPrimaryKeyForTemplates,
} = require('../../utils/entity');
const { prepareFieldForTemplates } = require('../../utils/field');
const { createUserEntity } = require('../../utils/user');
const { OAUTH2 } = require('../../jdl/jhipster/authentication-types');
const { CommonDBTypes } = require('../../jdl/jhipster/field-types');
const { detectCrLf, normalizeLineEndings } = require('../utils');

const { LONG: TYPE_LONG } = CommonDBTypes;

module.exports = class extends BaseGenerator {
  constructor(args, options, features) {
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
      this.config.set(this.options.localConfig);
    }

    if (this.options.help) return;

    this.loadStoredAppOptions();

    // Load common runtime options.
    this.parseCommonRuntimeOptions();
  }

  _loading() {
    return {
      createUserManagementEntities() {
        this._createUserManagementEntities();
      },
      loadClientPackageManager() {
        if (this.jhipsterConfig.clientPackageManager) {
          this.env.options.nodePackageManager = this.jhipsterConfig.clientPackageManager;
        }
      },
    };
  }

  get [LOADING_PRIORITY]() {
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _preConflicts() {
    return {
      async commitPrettierConfig() {
        if (this.options.skipCommit) {
          this.debug('Skipping commit prettier');
          return;
        }
        await this._commitSharedFs(this.env.sharedFs.stream().pipe(patternFilter('**/{.prettierrc**,.prettierignore}')), true);
      },
      async commitFiles() {
        if (this.options.skipCommit) {
          this.debug('Skipping commit files');
          return;
        }
        this.env.sharedFs.once('change', () => {
          this._queueCommit();
        });
        await this._commitSharedFs();
      },
    };
  }

  get [PRE_CONFLICTS_PRIORITY]() {
    return this._preConflicts();
  }

  /**
   * Queue environment's commit task.
   */
  _queueCommit() {
    this.debug('Queueing conflicts task');
    this.queueTask(
      {
        method: async () => {
          this.debug('Adding queueCommit event listener');
          this.env.sharedFs.once('change', () => {
            this._queueCommit();
          });
          await this._commitSharedFs();
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
  async _commitSharedFs(stream = this.env.sharedFs.stream(), skipPrettier = this.options.skipPrettier) {
    const { skipYoResolve } = this.options;
    const { withGeneratedFlag, autoCrlf } = this.jhipsterConfig;

    // JDL writes directly to disk, set the file as modified so prettier will be applied
    const { upgradeCommand, ignoreErrors } = this.options;
    if (!upgradeCommand) {
      stream = stream.pipe(
        patternSpy(file => {
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
          value: ({ relativeFilePath }) => {
            this.env.fs.append(`${this.env.cwd}/.yo-resolve`, `${relativeFilePath} skip`, { create: true });
            return 'skip';
          },
        },
      ],
    };

    const createApplyPrettierTransform = () => {
      const prettierOptions = { packageJson: true, java: !this.skipServer && !this.jhipsterConfig.skipServer };
      // Prettier is clever, it uses correct rules and correct parser according to file extension.
      return prettierTransform(prettierOptions, this, upgradeCommand || ignoreErrors);
    };

    const createForceWriteConfigFiles = () =>
      patternSpy(file => {
        file.conflicter = 'force';
      }, '**/.jhipster/*.json').name('jhipster:config-files:force');

    const convertToCRLF = () =>
      transform(async file => {
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
      // multi-step changes the file path, should be executed earlier in the pipeline
      new MultiStepTransform(),
      ...(skipYoResolve ? [] : [createApplyYoResolveTransform(this.env.conflicter)]),
      createForceYoRcTransform(),
      createForceWriteConfigFiles(),
      ...(withGeneratedFlag ? [generatedAnnotationTransform(this)] : []),
      ...(skipPrettier ? [] : [createApplyPrettierTransform()]),
      ...(autoCrlf ? [convertToCRLF()] : []),
      createConflicterCheckTransform(this.env.conflicter, conflicterStatus),
      createConflicterStatusTransform(),
    ];

    await this.env.fs.commit(transformStreams, stream);
  }

  _createUserManagementEntities() {
    this.configOptions.sharedLiquibaseFakeData = this.configOptions.sharedLiquibaseFakeData || {};

    if (
      this.configOptions.sharedEntities.User ||
      (this.jhipsterConfig.skipUserManagement && this.jhipsterConfig.authenticationType !== OAUTH2)
    ) {
      return;
    }

    const changelogDateDate = this.jhipsterConfig.creationTimestamp ? new Date(this.jhipsterConfig.creationTimestamp) : new Date();
    const changelogDate = formatDateForChangelog(changelogDateDate);

    const user = createUserEntity.call(this, { changelogDate });

    prepareEntityForTemplates(user, this);
    prepareEntityServerDomainForTemplates(user);
    prepareEntityPrimaryKeyForTemplates(user, this);

    user.fields.forEach(field => {
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
};
