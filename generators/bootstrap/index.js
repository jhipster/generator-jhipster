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
const filter = require('gulp-filter');
const _ = require('lodash');
const path = require('path');
const {
  createEachFileTransform,
  createConflicterStatusTransform,
  createYoRcTransform,
  createYoResolveTransform,
} = require('yeoman-environment/lib/util/transform');

const BaseGenerator = require('../generator-base');
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
  constructor(args, options) {
    super(args, options, { unique: 'namespace', customCommitTask: true });

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

    // Load common runtime options.
    this.parseCommonRuntimeOptions();
  }

  _loading() {
    return {
      createUserManagementEntities() {
        this._createUserManagementEntities();
      },

      loadClientPackageManager() {
        this.env.options.nodePackageManager = this.jhipsterConfig.clientPackageManager;
      },
    };
  }

  get loading() {
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
        await this._commitSharedFs(this.env.sharedFs.stream().pipe(filter(['.prettierrc', '.prettierignore'])));
      },
      async commitFiles() {
        if (this.options.skipCommit) {
          this.debug('Skipping commit files');
          return;
        }
        await this._commitSharedFs();
        this.env.sharedFs.once('change', () => {
          this._queueCommit();
        });
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
          await this._commitSharedFs();
          this.debug('Adding queueCommit event listener');
          this.env.sharedFs.once('change', () => {
            this._queueCommit();
          });
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
  _commitSharedFs(stream = this.env.sharedFs.stream()) {
    return new Promise((resolve, reject) => {
      this.env.sharedFs.each(file => {
        if (
          file.contents &&
          (path.basename(file.path) === '.yo-rc.json' ||
            (path.extname(file.path) === '.json' && path.basename(path.dirname(file.path)) === '.jhipster'))
        ) {
          file.state = file.state || 'modified';
        }
      });
      const transformStreams = [
        createYoResolveTransform(this.env.conflicter),
        createYoRcTransform(),
        createEachFileTransform(file => {
          if (path.extname(file.path) === '.json' && path.basename(path.dirname(file.path)) === '.jhipster') {
            file.conflicter = 'force';
          }
          return file;
        }),
      ];

      if (this.jhipsterConfig.withGeneratedFlag) {
        transformStreams.push(generatedAnnotationTransform(this));
      }

      if (!this.options.skipPrettier) {
        const prettierOptions = { packageJson: true, java: !this.skipServer && !this.jhipsterConfig.skipServer };
        // Prettier is clever, it uses correct rules and correct parser according to file extension.
        const filterPatternForPrettier = `{,.,**/,.jhipster/**/}*.{${this.getPrettierExtensions()}}`;
        // docker-compose modifies .yo-rc.json from others folder, match them all.
        const prettierFilter = filter(['**/.yo-rc.json', filterPatternForPrettier], { restore: true });
        // this pipe will pass through (restore) anything that doesn't match typescriptFilter
        transformStreams.push(prettierFilter, prettierTransform(prettierOptions, this, this.options.ignoreErrors), prettierFilter.restore);
      }

      transformStreams.push(
        createEachFileTransform(file => this.env.conflicter.checkForCollision(file), { ordered: false, maxParallel: 10 }),
        createConflicterStatusTransform()
      );

      this.env.fs.commit(transformStreams, stream, (error, value) => {
        if (error) {
          reject(error);
          return;
        }

        // Force to empty Conflicter queue.
        this.env.conflicter.queue.once('end', () => resolve(value));
        this.env.conflicter.queue.run();
      });
    });
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

    user.resetFakerSeed();
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
