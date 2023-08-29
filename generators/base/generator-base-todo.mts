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
import { loadLanguagesConfig } from '../languages/support/index.mjs';
import {
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
import { loadAppConfig, loadDerivedAppConfig, loadStoredAppOptions } from '../app/support/index.mjs';

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
  dateFormatForLiquibase(reproducible = this.sharedData.get('configOptions').reproducible) {
    const configOptions = this.sharedData.get('configOptions');
    let now = new Date();
    // Miliseconds is ignored for changelogDate.
    now.setMilliseconds(0);
    // Run reproducible timestamp when regenerating the project with with-entities option.
    if (reproducible || configOptions.creationTimestamp) {
      if (configOptions.reproducibleLiquibaseTimestamp) {
        // Counter already started.
        now = configOptions.reproducibleLiquibaseTimestamp;
      } else {
        // Create a new counter
        const creationTimestamp = configOptions.creationTimestamp || this.config.get('creationTimestamp');
        now = creationTimestamp ? new Date(creationTimestamp) : now;
        now.setMilliseconds(0);
      }
      now.setMinutes(now.getMinutes() + 1);
      configOptions.reproducibleLiquibaseTimestamp = now;

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
   * @deprecated
   */
  parseCommonRuntimeOptions(options: any = this.options, dest = this.sharedData.get('configOptions')) {
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
   * @deprecated
   */
  loadStoredAppOptions(options: any = this.options) {
    loadStoredAppOptions({ jhipsterConfig: this.jhipsterConfig, sharedData: this.sharedData, options, log: this.log });
  }

  /**
   * Load runtime options into dest.
   * @deprecated
   */
  loadRuntimeOptions(config = this.sharedData.get('configOptions'), dest: any = this) {
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
