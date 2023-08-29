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
import JHipsterBaseCoreGenerator from '../base-core/index.mjs';
import { formatDateForChangelog, parseCreationTimestamp } from './support/index.mjs';
import { detectLanguage, loadLanguagesConfig } from '../languages/support/index.mjs';
import {
  getDBTypeFromDBValue,
  getFKConstraintName,
  getUXConstraintName,
  loadDerivedPlatformConfig,
  loadDerivedServerConfig,
  loadPlatformConfig,
  loadServerAndPlatformConfig,
  loadServerConfig,
} from '../server/support/index.mjs';
import { getJdbcUrl, getR2dbcUrl } from '../spring-data-relational/support/index.mjs';
import { loadClientConfig, loadDerivedClientConfig } from '../client/support/index.mjs';
import { loadAppConfig, loadDerivedAppConfig } from '../app/support/index.mjs';

/**
 * Class the contains the methods that should be refactored and converted to typescript.
 */
export default abstract class JHipsterBaseGenerator extends JHipsterBaseCoreGenerator {
  abstract get jhipsterConfigWithDefaults(): any;

  /**
   * @private
   * Add a new entity in the "global.json" translations.
   *
   * @param {string} key - Key for the entity name
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addEntityTranslationKey(key, value, language, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    this.needleApi.clientI18n.addEntityTranslationKey(key, value, language, webappSrcDir);
  }

  /**
   * Add webpack config.
   *
   * @param {string} config - webpack config to be merged
   */
  addWebpackConfig(config, clientFramework) {
    this.needleApi.clientWebpack.addWebpackConfig(config, clientFramework);
  }

  /**
   * Generate a date to be used by Liquibase changelogs.
   *
   * @param {Boolean} [reproducible=true] - Set true if the changelog date can be reproducible.
   *                                 Set false to create a changelog date incrementing the last one.
   * @return {String} Changelog date.
   */
  dateFormatForLiquibase(reproducible = this.configOptions.reproducible) {
    let now = new Date();
    // Miliseconds is ignored for changelogDate.
    now.setMilliseconds(0);
    // Run reproducible timestamp when regenerating the project with with-entities option.
    if (reproducible || this.configOptions.creationTimestamp) {
      if (this.configOptions.reproducibleLiquibaseTimestamp) {
        // Counter already started.
        now = this.configOptions.reproducibleLiquibaseTimestamp;
      } else {
        // Create a new counter
        const creationTimestamp = this.configOptions.creationTimestamp || this.config.get('creationTimestamp');
        now = creationTimestamp ? new Date(creationTimestamp) : now;
        now.setMilliseconds(0);
      }
      now.setMinutes(now.getMinutes() + 1);
      this.configOptions.reproducibleLiquibaseTimestamp = now;

      // Reproducible build can create future timestamp, save it.
      const lastLiquibaseTimestamp = this.jhipsterConfig.lastLiquibaseTimestamp;
      if (!lastLiquibaseTimestamp || now.getTime() > lastLiquibaseTimestamp) {
        this.config.set('lastLiquibaseTimestamp', now.getTime());
      }
    } else {
      // Get and store lastLiquibaseTimestamp, a future timestamp can be used
      let lastLiquibaseTimestamp = this.jhipsterConfig.lastLiquibaseTimestamp;
      if (lastLiquibaseTimestamp) {
        lastLiquibaseTimestamp = new Date(lastLiquibaseTimestamp);
        if (lastLiquibaseTimestamp >= now) {
          now = lastLiquibaseTimestamp;
          now.setSeconds(now.getSeconds() + 1);
          now.setMilliseconds(0);
        }
      }
      this.jhipsterConfig.lastLiquibaseTimestamp = now.getTime();
    }
    return formatDateForChangelog(now);
  }

  /**
   * @private
   * get a foreign key constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} relationshipName - name of the related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getFKConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase) {
    const result = getFKConstraintName(entityName, relationshipName, { prodDatabaseType, noSnakeCase });
    (this as any).validateResult(result);
    return result.value;
  }

  /**
   * @private
   * get a unique constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} columnName - name of the column
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getUXConstraintName(entityName, columnName, prodDatabaseType, noSnakeCase) {
    const result = getUXConstraintName(entityName, columnName, { prodDatabaseType, noSnakeCase });
    (this as any).validateResult(result);
    return result.value;
  }

  /**
   * Parse runtime options.
   * @param {Object} [options] - object to load from.
   * @param {Object} [dest] - object to write to.
   */
  parseCommonRuntimeOptions(options: any = this.options, dest = this.configOptions) {
    if (options.withEntities !== undefined) {
      dest.withEntities = options.withEntities;
    }
    if (options.debug !== undefined) {
      dest.isDebugEnabled = options.debug;
    }
    if (options.skipPrompts !== undefined) {
      dest.skipPrompts = options.skipPrompts;
    }
    if (options.skipClient !== undefined) {
      dest.skipClient = options.skipClient;
    }
    if (dest.creationTimestamp === undefined && options.creationTimestamp) {
      const creationTimestamp = parseCreationTimestamp(options.creationTimestamp);
      if (creationTimestamp) {
        dest.creationTimestamp = creationTimestamp;
      } else {
        this.log.warn(`Error parsing creationTimestamp ${options.creationTimestamp}.`);
      }
    }
    if (options.reproducible !== undefined) {
      dest.reproducible = options.reproducible;
    }
  }

  /**
   * Load common options to be stored.
   * @param {Object} [options] - options object to be loaded from.
   */
  loadStoredAppOptions(options: any = this.options) {
    // Parse options only once.
    if (this.configOptions.optionsParsed) return;
    this.configOptions.optionsParsed = true;

    // Load stored options
    if (options.skipJhipsterDependencies !== undefined) {
      this.jhipsterConfig.skipJhipsterDependencies = options.skipJhipsterDependencies;
    }
    if (options.incrementalChangelog !== undefined) {
      this.jhipsterConfig.incrementalChangelog = options.incrementalChangelog;
    }
    if (options.withAdminUi !== undefined) {
      this.jhipsterConfig.withAdminUi = options.withAdminUi;
    }
    if (options.skipClient) {
      (this as any).skipClient = this.jhipsterConfig.skipClient = true;
    }
    if (options.applicationType) {
      this.jhipsterConfig.applicationType = options.applicationType;
    }
    if (options.skipServer) {
      (this as any).skipServer = this.jhipsterConfig.skipServer = true;
    }
    if (options.skipFakeData) {
      this.jhipsterConfig.skipFakeData = true;
    }
    if (options.skipUserManagement) {
      this.jhipsterConfig.skipUserManagement = true;
    }
    if (options.skipCheckLengthOfIdentifier) {
      this.jhipsterConfig.skipCheckLengthOfIdentifier = true;
    }

    if (options.skipCommitHook) {
      this.jhipsterConfig.skipCommitHook = true;
    }

    if (options.baseName) {
      this.jhipsterConfig.baseName = this.options.baseName;
    }
    if (options.db) {
      const databaseType = getDBTypeFromDBValue(this.options.db);
      if (databaseType) {
        this.jhipsterConfig.databaseType = databaseType;
      } else if (!this.jhipsterConfig.databaseType) {
        throw new Error(`Could not detect databaseType for database ${this.options.db}`);
      }
      this.jhipsterConfig.devDatabaseType = options.db;
      this.jhipsterConfig.prodDatabaseType = options.db;
    }
    if (options.auth) {
      this.jhipsterConfig.authenticationType = options.auth;
    }
    if (options.searchEngine) {
      this.jhipsterConfig.searchEngine = options.searchEngine;
    }
    if (options.build) {
      this.jhipsterConfig.buildTool = options.build;
    }
    if (options.websocket) {
      this.jhipsterConfig.websocket = options.websocket;
    }
    if (options.jhiPrefix !== undefined) {
      this.jhipsterConfig.jhiPrefix = options.jhiPrefix;
    }
    if (options.entitySuffix !== undefined) {
      this.jhipsterConfig.entitySuffix = options.entitySuffix;
    }
    if (options.dtoSuffix !== undefined) {
      this.jhipsterConfig.dtoSuffix = options.dtoSuffix;
    }
    if (options.clientFramework) {
      this.jhipsterConfig.clientFramework = options.clientFramework;
    }
    if (options.testFrameworks) {
      this.jhipsterConfig.testFrameworks = [...new Set([...(this.jhipsterConfig.testFrameworks || []), ...options.testFrameworks])];
    }
    if (options.cypressCoverage !== undefined) {
      this.jhipsterConfig.cypressCoverage = options.cypressCoverage;
    }
    if (options.cypressAudit !== undefined) {
      this.jhipsterConfig.cypressAudit = options.cypressAudit;
    }
    if (options.enableTranslation !== undefined) {
      this.jhipsterConfig.enableTranslation = options.enableTranslation;
    }
    if (options.language) {
      // workaround double options parsing, remove once generator supports skipping parse options
      const languages = options.language.flat();
      if (languages.length === 1 && languages[0] === 'false') {
        this.jhipsterConfig.enableTranslation = false;
      } else {
        this.jhipsterConfig.languages = [...(this.jhipsterConfig.languages || []), ...languages];
      }
    }
    if (options.nativeLanguage) {
      if (typeof options.nativeLanguage === 'string') {
        this.jhipsterConfig.nativeLanguage = options.nativeLanguage;
        if (!this.jhipsterConfig.languages) {
          this.jhipsterConfig.languages = [options.nativeLanguage];
        }
      } else if (options.nativeLanguage === true) {
        this.jhipsterConfig.nativeLanguage = detectLanguage();
      }
    }

    if (options.creationTimestamp) {
      const creationTimestamp = parseCreationTimestamp(options.creationTimestamp);
      if (creationTimestamp) {
        this.configOptions.creationTimestamp = creationTimestamp;
        if (this.jhipsterConfig.creationTimestamp === undefined) {
          this.jhipsterConfig.creationTimestamp = creationTimestamp;
        }
      } else {
        this.log.warn(`Error parsing creationTimestamp ${options.creationTimestamp}.`);
      }
    }

    if (options.pkType) {
      this.jhipsterConfig.pkType = options.pkType;
    }

    if (options.cacheProvider !== undefined) {
      this.jhipsterConfig.cacheProvider = options.cacheProvider;
    }

    if (options.enableHibernateCache !== undefined) {
      this.jhipsterConfig.enableHibernateCache = options.enableHibernateCache;
    }

    if (options.microfrontend) {
      this.jhipsterConfig.microfrontend = options.microfrontend;
    }

    if (options.reactive !== undefined) {
      this.jhipsterConfig.reactive = options.reactive;
    }

    if (options.enableSwaggerCodegen !== undefined) {
      this.jhipsterConfig.enableSwaggerCodegen = options.enableSwaggerCodegen;
    }

    if (options.clientPackageManager) {
      this.jhipsterConfig.clientPackageManager = options.clientPackageManager;
    }
    if (this.jhipsterConfig.clientPackageManager) {
      const usingNpm = this.jhipsterConfig.clientPackageManager === 'npm';
      if (!usingNpm) {
        this.log.warn(`Using unsupported package manager: ${this.jhipsterConfig.clientPackageManager}. Install will not be executed.`);
        options.skipInstall = true;
      }
    }
  }

  /**
   * Load runtime options into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadRuntimeOptions(config = this.configOptions, dest: any = this) {
    dest.withEntities = config.withEntities;
    dest.isDebugEnabled = config.isDebugEnabled;
    dest.logo = config.logo;
    config.backendName = config.backendName || 'Java';
    dest.backendName = config.backendName;
  }

  /**
   * @deprecated
   */
  loadAppConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    loadAppConfig({ config, application: dest, useVersionPlaceholders: (this as any).useVersionPlaceholders });
  }

  /**
   * @deprecated
   */
  loadDerivedAppConfig(dest: any = this) {
    loadDerivedAppConfig({ application: dest });
  }

  /**
   * @deprecated
   */
  loadClientConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    loadClientConfig({ config, application: dest });
  }

  /**
   * @deprecated
   */
  loadDerivedClientConfig(dest: any = this) {
    loadDerivedClientConfig({ application: dest });
  }

  /**
   * @deprecated
   */
  loadTranslationConfig(config = this.jhipsterConfigWithDefaults, application: any = this) {
    loadLanguagesConfig({ application, config });
  }

  /**
   * @deprecated
   */
  loadServerConfig(config = this.jhipsterConfigWithDefaults, application: any = this) {
    loadServerConfig({ config, application });
  }

  /**
   * @deprecated
   */
  loadServerAndPlatformConfig(application: any = this) {
    loadServerAndPlatformConfig({ application });
  }

  /**
   * @deprecated
   */
  loadDerivedServerConfig(application: any = this) {
    loadDerivedServerConfig({ application });
    (this as any).loadServerAndPlatformConfig(application);
  }

  /**
   * @deprecated
   */
  loadPlatformConfig(config = this.jhipsterConfigWithDefaults, application: any = this) {
    loadPlatformConfig({ config, application });
    (this as any).loadDerivedPlatformConfig(application);
  }

  /**
   * @deprecated
   */
  loadDerivedPlatformConfig(application: any = this) {
    loadDerivedPlatformConfig({ application });
    (this as any).loadServerAndPlatformConfig(application);
  }

  /**
   * @private
   * Returns the JDBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getJDBCUrl(databaseType, options = {}) {
    return getJdbcUrl(databaseType, options);
  }

  /**
   * @private
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(databaseType, options = {}) {
    return getR2dbcUrl(databaseType, options);
  }
}
