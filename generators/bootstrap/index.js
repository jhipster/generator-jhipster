/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const {
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  createYoRcTransform: createForceYoRcTransform,
  createYoResolveTransform: createApplyYoResolveTransform,
  patternFilter,
  patternSpy,
} = require('yeoman-environment/transform');

const { hasState, setModifiedFileState } = State;

const BaseGenerator = require('../generator-base');
const { LOADING_PRIORITY } = require('../../lib/constants/priorities.cjs').compat;

const { MultiStepTransform } = require('../../utils/multi-step-transform');
const { defaultConfig } = require('../generator-defaults');
const { prettierTransform, generatedAnnotationTransform } = require('../generator-transforms');
const { formatDateForChangelog, prepareFieldForLiquibaseTemplates } = require('../../utils/liquibase');
const { prepareEntityForTemplates, prepareEntityPrimaryKeyForTemplates, loadRequiredConfigIntoEntity } = require('../../utils/entity');
const { prepareFieldForTemplates } = require('../../utils/field');
const { OAUTH2 } = require('../../jdl/jhipster/authentication-types');
const { SQL } = require('../../jdl/jhipster/database-types');
const { CommonDBTypes } = require('../../jdl/jhipster/field-types');

const { STRING: TYPE_STRING, LONG: TYPE_LONG } = CommonDBTypes;

module.exports = class extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', customCommitTask: true, ...features });

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

    if (this.options.withGeneratedFlag !== undefined) {
      this.jhipsterConfig.withGeneratedFlag = this.options.withGeneratedFlag;
    }

    if (this.options.help) return;

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

  get preConflicts() {
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
   * @return {Promise}
   */
  async _commitSharedFs(stream = this.env.sharedFs.stream(), skipPrettier = this.options.skipPrettier) {
    const { skipYoResolve } = this.options;
    const { withGeneratedFlag } = this.jhipsterConfig;

    // JDL writes directly to disk, set the file as modified so prettier will be applied
    stream = stream.pipe(
      patternSpy(file => {
        if (file.contents && !hasState(file) && !this.options.reproducibleTests) {
          setModifiedFileState(file);
        }
      }, '**/{.yo-rc.json,.jhipster/*.json}').name('jhipster:config-files:modify')
    );

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
      const ignoreErrors = this.options.commandName === 'upgrade' || this.options.ignoreErrors;
      return prettierTransform(prettierOptions, this, ignoreErrors);
    };

    const createForceWriteConfigFiles = () =>
      patternSpy(file => {
        file.conflicter = 'force';
      }, '**/.jhipster/*.json').name('jhipster:config-files:force');

    const transformStreams = [
      // multi-step changes the file path, should be executed earlier in the pipeline
      new MultiStepTransform(),
      ...(skipYoResolve ? [] : [createApplyYoResolveTransform(this.env.conflicter)]),
      createForceYoRcTransform(),
      createForceWriteConfigFiles(),
      ...(withGeneratedFlag ? [generatedAnnotationTransform(this)] : []),
      ...(skipPrettier ? [] : [createApplyPrettierTransform()]),
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

    const userEntityDefinition = this.readEntityJson('User');
    if (userEntityDefinition) {
      if (userEntityDefinition.relationships && userEntityDefinition.relationships.length > 0) {
        this.warning('Relationships on the User entity side will be disregarded');
      }
      if (userEntityDefinition.fields && userEntityDefinition.fields.some(field => field.fieldName !== 'id')) {
        this.warning('Fields on the User entity side (other than id) will be disregarded');
      }
    }

    // Create entity definition for built-in entity to make easier to deal with relationships.
    const user = {
      name: 'User',
      builtIn: true,
      entityTableName: `${this.getTableName(this.jhipsterConfig.jhiPrefix)}_user`,
      relationships: [],
      changelogDate,
      fields: userEntityDefinition ? userEntityDefinition.fields || [] : [],
      dto: true,
    };

    loadRequiredConfigIntoEntity(user, this.jhipsterConfig);
    // Fallback to defaults for test cases.
    loadRequiredConfigIntoEntity(user, defaultConfig);

    const oauth2 = user.authenticationType === OAUTH2;
    const userIdType = oauth2 || user.databaseType !== SQL ? TYPE_STRING : this.getPkType(user.databaseType);
    const fieldValidateRulesMaxlength = userIdType === TYPE_STRING ? 100 : undefined;

    let idField = user.fields.find(field => field.fieldName === 'id');
    if (!idField) {
      idField = {};
      user.fields.unshift(idField);
    }
    _.defaults(idField, {
      fieldName: 'id',
      fieldType: userIdType,
      fieldValidateRulesMaxlength,
      fieldTranslationKey: 'global.field.id',
      fieldNameHumanized: 'ID',
      id: true,
      builtIn: true,
    });

    if (!user.fields.some(field => field.fieldName === 'login')) {
      user.fields.push({
        fieldName: 'login',
        fieldType: TYPE_STRING,
        builtIn: true,
      });
    }

    if (!user.fields.some(field => field.fieldName === 'firstName')) {
      user.fields.push({
        fieldName: 'firstName',
        fieldType: TYPE_STRING,
      });
    }

    if (!user.fields.some(field => field.fieldName === 'lastName')) {
      user.fields.push({
        fieldName: 'lastName',
        fieldType: TYPE_STRING,
      });
    }

    prepareEntityForTemplates(user, this);
    prepareEntityPrimaryKeyForTemplates(user, this);

    user.fields.forEach(field => {
      prepareFieldForTemplates(user, field, this);
      prepareFieldForLiquibaseTemplates(user, field);
    });
    this.configOptions.sharedEntities.User = user;

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
