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
import assert from 'assert';
import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import fs from 'fs';
import { exec } from 'child_process';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import YeomanGenerator, { type Storage } from 'yeoman-generator';
import { formatDateForChangelog, normalizePathEnd, createJHipster7Context, upperFirstCamelCase, Logger } from './support/index.mjs';
import { packageJson } from '../../lib/index.mjs';
import { detectLanguage, loadLanguagesConfig } from '../languages/support/index.mjs';
import {
  getDBTypeFromDBValue,
  hibernateSnakeCase,
  calculateDbName,
  getFKConstraintName,
  getUXConstraintName,
} from '../server/support/index.mjs';
import {
  databaseTypes,
  monitoringTypes,
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  websocketTypes,
  testFrameworkTypes,
  applicationTypes,
  serviceDiscoveryTypes,
  searchEngineTypes,
  clientFrameworkTypes,
  getConfigWithDefaults,
} from '../../jdl/jhipster/index.mjs';
import { getJdbcUrl, getR2dbcUrl, prepareSqlApplicationProperties } from '../spring-data-relational/support/index.mjs';
import {
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_SRC_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_TEST_RES_DIR,
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
  NODE_VERSION,
  CLIENT_DIST_DIR,
} from '../generator-constants.mjs';
import { removeFieldsWithNullishValues, parseCreationTimestamp, getHipster } from './support/index.mjs';
import { getDefaultAppName } from '../project-name/support/index.mjs';
import { MESSAGE_BROKER_KAFKA, MESSAGE_BROKER_NO, MESSAGE_BROKER_PULSAR } from '../server/options/index.mjs';
import type { JHipsterGeneratorFeatures, JHipsterGeneratorOptions } from './api.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { ANGULAR, REACT, VUE, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;
const GENERATOR_JHIPSTER = 'generator-jhipster';
const { ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, SQL, MONGODB, COUCHBASE, NEO4J, CASSANDRA, H2_MEMORY, H2_DISK } = databaseTypes;
const NO_DATABASE = databaseTypes.NO;
const { PROMETHEUS, ELK } = monitoringTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { CAFFEINE, EHCACHE, REDIS, HAZELCAST, INFINISPAN, MEMCACHED } = cacheTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { SPRING_WEBSOCKET } = websocketTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { ELASTICSEARCH } = searchEngineTypes;
const NO_CACHE = cacheTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const NO_SEARCH_ENGINE = searchEngineTypes.NO;
const NO_WEBSOCKET = websocketTypes.NO;

const isWin32 = os.platform() === 'win32';

/**
 * Class the contains the methods that should be refactored and converted to typescript.
 */
export default abstract class JHipsterBaseGenerator extends YeomanGenerator<JHipsterGeneratorOptions, JHipsterGeneratorFeatures> {
  abstract jhipsterConfig: any;
  abstract needleApi: any;
  abstract sharedData: any;
  abstract configOptions: any;
  declare log: Logger;

  /**
   * @private
   * Add a new element in the "global.json" translations.
   *
   * @param {string} key - Key for the menu entry
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addElementTranslationKey(key, value, language, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    this.needleApi.clientI18n.addElementTranslationKey(key, value, language, webappSrcDir);
  }

  /**
   * @private
   * Add a new element in the admin section of "global.json" translations.
   *
   * @param {string} key - Key for the menu entry
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addAdminElementTranslationKey(key, value, language, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    this.needleApi.clientI18n.addAdminElementTranslationKey(key, value, language, webappSrcDir);
  }

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
   * @private
   * Copy third-party library resources path.
   *
   * @param {string} sourceFolder - third-party library resources source path
   * @param {string} targetFolder - third-party library resources destination path
   */
  copyExternalAssetsInWebpack(sourceFolder, targetFolder) {
    this.needleApi.clientWebpack.copyExternalAssets(sourceFolder, targetFolder);
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
   * Rewrite the specified file with provided content at the needle location
   *
   * @param {string} filePath - path of the source file to rewrite
   * @param {string} needle - needle to look for where content will be inserted
   * @param {string} content - content to be written
   * @returns {boolean} true if the body has changed.
   */
  rewriteFile(filePath, needle, content) {
    const rewriteFileModel = this.needleApi.base.generateFileModel(filePath, needle, content);
    return this.needleApi.base.addBlockContentToFile(rewriteFileModel);
  }

  /**
   * @private
   * Get a name suitable for microservice
   * @param {string} microserviceName
   */
  getMicroserviceAppName(microserviceName) {
    return _.camelCase(microserviceName) + (microserviceName.endsWith('App') ? '' : 'App');
  }

  /**
   * @private
   * get a table column name in JHipster preferred style.
   *
   * @param {string} value - table column name string
   */
  getColumnName(value) {
    return hibernateSnakeCase(value);
  }

  /**
   * @private
   * get a constraint name for tables in JHipster preferred style
   *
   * @param {string} entityName - name of the entity
   * @param {string} columnOrRelationName - name of the column or related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   * @param {string} prefix - constraintName prefix for the constraintName
   * @param {string} suffix - constraintName suffix for the constraintName
   */
  getConstraintName(entityName, columnOrRelationName, prodDatabaseType, noSnakeCase, prefix = '', suffix = '') {
    const result = calculateDbName(entityName, columnOrRelationName, { prodDatabaseType, noSnakeCase, prefix, suffix });
    (this as any).validateResult(result);
    return result.value;
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
   * Print an error message.
   *
   * @param {string} msg - message to print
   */
  error(msg) {
    this.log.error();
    throw new Error(`${msg}`);
  }

  /**
   * Print a success message.
   *
   * @param {string} msg - message to print
   */
  success(msg) {
    this.log.ok(msg);
  }

  /**
   * @private
   * get the frontend application name.
   * @param {string} baseName of application - (defaults to <code>this.jhipsterConfig.baseName</code>)
   */
  getFrontendAppName(baseName = this.jhipsterConfig.baseName) {
    const name = _.camelCase(baseName) + (baseName.endsWith('App') ? '' : 'App');
    return name.match(/^\d/) ? 'App' : name;
  }

  /**
   * get the an upperFirst camelCase value.
   * @param {string} value string to convert
   */
  upperFirstCamelCase(value) {
    return upperFirstCamelCase(value);
  }

  /**
   * @private
   * get the java main class name.
   * @param {string} baseName of application
   */
  getMainClassName(baseName = (this as any).baseName) {
    const main = _.upperFirst((this as any).getMicroserviceAppName(baseName));
    const acceptableForJava = new RegExp('^[A-Z][a-zA-Z0-9_]*$');

    return acceptableForJava.test(main) ? main : 'Application';
  }

  /**
   * build a generated application.
   *
   * @param {String} buildTool - maven | gradle
   * @param {String} profile - dev | prod
   * @param {Boolean} buildWar - build a war instead of a jar
   * @param {Function} cb - callback when build is complete
   * @returns {object} the command line and its result
   */
  buildApplication(buildTool, profile, buildWar, cb) {
    let buildCmd = 'mvnw -ntp verify -B';

    if (buildTool === GRADLE) {
      buildCmd = 'gradlew';
      if (buildWar) {
        buildCmd += ' bootWar';
      } else {
        buildCmd += ' bootJar';
      }
    }
    if (buildWar) {
      buildCmd += ' -Pwar';
    }

    if (!isWin32) {
      buildCmd = `./${buildCmd}`;
    }
    buildCmd += ` -P${profile}`;
    return {
      stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
      buildCmd,
    };
  }

  /**
   * @private
   * run a command using the configured Java build tool.
   *
   * @param {String} buildTool - maven | gradle
   * @param {String} profile - dev | prod
   * @param {String} command - the command (goal/task) to run
   * @param {Function} cb - callback when build is complete
   * @returns {object} the command line and its result
   */
  runJavaBuildCommand(buildTool, profile, command, cb) {
    let buildCmd = `mvnw -ntp -DskipTests=true -B ${command}`;

    if (buildTool === GRADLE) {
      buildCmd = `gradlew -x ${command}`;
    }

    if (!isWin32) {
      buildCmd = `./${buildCmd}`;
    }
    buildCmd += ` -P${profile}`;
    this.log.verboseInfo(`Running command: '${chalk.bold(buildCmd)}'`);
    return {
      stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
      buildCmd,
    };
  }

  /**
   * write the given files using provided options.
   *
   * @template DataType
   * @param {import('./api.mjs').WriteFileOptions<this, DataType>} options
   * @return {Promise<string[]>}
   */
  async internalWriteFiles(options) {
    const paramCount = Object.keys(options).filter(key => ['sections', 'blocks', 'templates'].includes(key)).length;
    assert(paramCount > 0, 'One of sections, blocks or templates is required');
    assert(paramCount === 1, 'Only one of sections, blocks or templates must be provided');

    const { sections, blocks, templates, rootTemplatesPath, context = this, transform: methodTransform = [] } = options;
    const { _: commonSpec = {} } = sections || {};
    const { transform: sectionTransform = [] } = commonSpec;
    const startTime = new Date().getMilliseconds();

    /* Build lookup order first has preference.
     * Example
     * rootTemplatesPath = ['reactive', 'common']
     * jhipsterTemplatesFolders = ['/.../generator-jhispter-blueprint/server/templates', '/.../generator-jhispter/server/templates']
     *
     * /.../generator-jhispter-blueprint/server/templates/reactive/templatePath
     * /.../generator-jhispter-blueprint/server/templates/common/templatePath
     * /.../generator-jhispter/server/templates/reactive/templatePath
     * /.../generator-jhispter/server/templates/common/templatePath
     */
    let rootTemplatesAbsolutePath;
    if (!rootTemplatesPath) {
      rootTemplatesAbsolutePath = (this as any).jhipsterTemplatesFolders;
    } else if (typeof rootTemplatesPath === 'string' && path.isAbsolute(rootTemplatesPath)) {
      rootTemplatesAbsolutePath = rootTemplatesPath;
    } else {
      rootTemplatesAbsolutePath = (this as any).jhipsterTemplatesFolders
        .map(templateFolder => [].concat(rootTemplatesPath).map(relativePath => path.join(templateFolder, relativePath)))
        .flat();
    }

    const normalizeEjs = file => file.replace('.ejs', '');
    const resolveCallback = (val, fallback?) => {
      if (val === undefined) {
        if (typeof fallback === 'function') {
          return resolveCallback(fallback);
        }
        return fallback;
      }
      if (typeof val === 'boolean' || typeof val === 'string') {
        return val;
      }
      if (typeof val === 'function') {
        return val.call(this, context) || false;
      }
      throw new Error(`Type not supported ${val}`);
    };

    const renderTemplate = async ({ sourceFile, destinationFile, options, noEjs, transform, binary }) => {
      const extension = path.extname(sourceFile);
      const isBinary = binary || ['.png', '.jpg', '.gif', '.svg', '.ico'].includes(extension);
      const appendEjs = noEjs === undefined ? !isBinary && extension !== '.ejs' : !noEjs;
      const ejsFile = appendEjs || extension === '.ejs';
      let targetFile;
      if (typeof destinationFile === 'function') {
        targetFile = resolveCallback(destinationFile);
      } else {
        targetFile = appendEjs ? normalizeEjs(destinationFile) : destinationFile;
      }

      let sourceFileFrom;
      if (Array.isArray(rootTemplatesAbsolutePath)) {
        // Look for existing templates
        const existingTemplates = rootTemplatesAbsolutePath
          .map(rootPath => this.templatePath(rootPath, sourceFile))
          .filter(templateFile => fs.existsSync(appendEjs ? `${templateFile}.ejs` : templateFile));

        if (existingTemplates.length > 1) {
          const moreThanOneMessage = `Multiples templates were found for file ${sourceFile}, using the first
templates: ${JSON.stringify(existingTemplates, null, 2)}`;
          if (existingTemplates.length > 2) {
            this.log.warn(`Possible blueprint conflict detected: ${moreThanOneMessage}`);
          } else {
            this.log.debug(moreThanOneMessage);
          }
        }
        sourceFileFrom = existingTemplates.shift();

        if (sourceFileFrom === undefined) {
          throw new Error(`Template file ${sourceFile} was not found at ${rootTemplatesAbsolutePath}`);
        }
      } else if (typeof rootTemplatesAbsolutePath === 'string') {
        sourceFileFrom = this.templatePath(rootTemplatesAbsolutePath, sourceFile);
      } else {
        sourceFileFrom = this.templatePath(sourceFile);
      }
      if (appendEjs) {
        sourceFileFrom = `${sourceFileFrom}.ejs`;
      }

      if (!ejsFile) {
        await (this as any).copyTemplateAsync(sourceFileFrom, targetFile);
      } else {
        let useAsync = true;
        if (context.entityClass) {
          if (!context.baseName) {
            throw new Error('baseName is require at templates context');
          }
          const basename = path.basename(sourceFileFrom);
          const seed = `${context.entityClass}-${basename}${context.fakerSeed ?? ''}`;
          Object.values(this.sharedData.getApplication()?.sharedEntities ?? {}).forEach((entity: any) => {
            entity.resetFakerSeed(seed);
          });
          // Async calls will make the render method to be scheduled, allowing the faker key to change in the meantime.
          useAsync = false;
        }

        const renderOptions = {
          ...(options?.renderOptions ?? {}),
          // Set root for ejs to lookup for partials.
          root: rootTemplatesAbsolutePath,
          // ejs caching cause problem https://github.com/jhipster/generator-jhipster/pull/20757
          cache: false,
        };
        const copyOptions = { noGlob: true };
        // TODO drop for v8 final release
        const data = (this as any).jhipster7Migration ? createJHipster7Context(this, context, { ignoreWarnings: true }) : context;
        if (useAsync) {
          await (this as any).renderTemplateAsync(sourceFileFrom, targetFile, data, renderOptions, copyOptions);
        } else {
          (this as any).renderTemplate(sourceFileFrom, targetFile, data, renderOptions, copyOptions);
        }
      }
      if (!isBinary && transform && transform.length) {
        (this as any).editFile(targetFile, ...transform);
      }
      return targetFile;
    };

    let parsedBlocks = blocks;
    if (sections) {
      assert(typeof sections === 'object', 'sections must be an object');
      const parsedSections = Object.entries(sections)
        .map(([sectionName, sectionBlocks]) => {
          if (sectionName.startsWith('_')) return undefined;
          assert(Array.isArray(sectionBlocks), `Section must be an array for ${sectionName}`);
          return { sectionName, sectionBlocks };
        })
        .filter(Boolean);

      parsedBlocks = parsedSections
        .map(({ sectionName, sectionBlocks }: any) => {
          return sectionBlocks.map((block, blockIdx) => {
            const blockSpecPath = `${sectionName}[${blockIdx}]`;
            assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
            return { blockSpecPath, ...block };
          });
        })
        .flat();
    }

    let parsedTemplates;
    if (parsedBlocks) {
      parsedTemplates = parsedBlocks
        .map((block, blockIdx) => {
          const {
            blockSpecPath = `${blockIdx}`,
            path: blockPathValue = './',
            from: blockFromCallback,
            to: blockToCallback,
            condition: blockConditionCallback,
            transform: blockTransform = [],
            renameTo: blockRenameTo,
          } = block;
          assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
          assert(Array.isArray(block.templates), `Block templates must be an array for ${blockSpecPath}`);
          const condition = resolveCallback(blockConditionCallback);
          if (condition !== undefined && !condition) {
            return undefined;
          }
          if (typeof blockPathValue === 'function') {
            throw new Error(`Block path should be static for ${blockSpecPath}`);
          }
          const blockPath = resolveCallback(blockFromCallback, blockPathValue);
          const blockTo = resolveCallback(blockToCallback, blockPath) || blockPath;
          return block.templates.map((fileSpec, fileIdx) => {
            const fileSpecPath = `${blockSpecPath}[${fileIdx}]`;
            assert(
              typeof fileSpec === 'object' || typeof fileSpec === 'string' || typeof fileSpec === 'function',
              `File must be an object, a string or a function for ${fileSpecPath}`
            );
            if (typeof fileSpec === 'function') {
              fileSpec = fileSpec.call(this, context);
            }
            let { noEjs } = fileSpec;
            let derivedTransform;
            if (typeof blockTransform === 'boolean') {
              noEjs = !blockTransform;
              derivedTransform = [...methodTransform, ...sectionTransform];
            } else {
              derivedTransform = [...methodTransform, ...sectionTransform, ...blockTransform];
            }
            if (typeof fileSpec === 'string') {
              const sourceFile = path.join(blockPath, fileSpec);
              let destinationFile;
              if (blockRenameTo) {
                destinationFile = this.destinationPath(blockRenameTo.call(this, context, fileSpec, this));
              } else {
                destinationFile = this.destinationPath(blockTo, fileSpec);
              }
              return { sourceFile, destinationFile, noEjs, transform: derivedTransform };
            }

            const { options, file, renameTo, transform: fileTransform = [], binary } = fileSpec;
            let { sourceFile, destinationFile } = fileSpec;

            if (typeof fileTransform === 'boolean') {
              noEjs = !fileTransform;
            } else if (Array.isArray(fileTransform)) {
              derivedTransform = [...derivedTransform, ...fileTransform];
            } else if (fileTransform !== undefined) {
              throw new Error(`Transform ${fileTransform} value is not supported`);
            }

            const normalizedFile = resolveCallback(sourceFile || file);
            sourceFile = path.join(blockPath, normalizedFile);
            destinationFile = this.destinationPath(blockTo, path.join(resolveCallback(destinationFile || renameTo, normalizedFile)));

            const override = resolveCallback(fileSpec.override);
            if (override !== undefined && !override && (this as any).fs.exists(destinationFile)) {
              this.log.debug(`skipping file ${destinationFile}`);
              return undefined;
            }

            // TODO remove for jhipster 8
            if (noEjs === undefined) {
              const { method } = fileSpec;
              if (method === 'copy') {
                noEjs = true;
              }
            }

            return {
              sourceFile,
              destinationFile,
              options,
              transform: derivedTransform,
              noEjs,
              binary,
            };
          });
        })
        .flat()
        .filter(template => template);
    } else {
      parsedTemplates = templates.map(template => {
        if (typeof template === 'string') {
          return { sourceFile: template, destinationFile: template };
        }
        return template;
      });
    }

    const files = await Promise.all(parsedTemplates.map(template => renderTemplate(template)));
    this.log.debug(`Time taken to write files: ${new Date().getMilliseconds() - startTime}ms`);
    return files.filter(file => file);
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
   * Load app configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadAppConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    if ((this as any).useVersionPlaceholders) {
      dest.nodeVersion = 'NODE_VERSION';
    } else {
      dest.nodeVersion = NODE_VERSION;
    }

    dest.jhipsterVersion = config.jhipsterVersion;
    dest.baseName = config.baseName;
    dest.applicationType = config.applicationType;
    dest.reactive = config.reactive;
    dest.jhiPrefix = config.jhiPrefix;
    dest.skipFakeData = config.skipFakeData;
    dest.entitySuffix = config.entitySuffix;
    dest.dtoSuffix = config.dtoSuffix;
    dest.skipCheckLengthOfIdentifier = config.skipCheckLengthOfIdentifier;
    dest.microfrontend = config.microfrontend;
    dest.microfrontends = config.microfrontends;

    dest.skipServer = config.skipServer;
    dest.skipCommitHook = config.skipCommitHook;
    dest.blueprints = config.blueprints || [];
    dest.skipClient = config.skipClient;
    dest.prettierJava = config.prettierJava;
    dest.pages = config.pages;
    dest.skipJhipsterDependencies = !!config.skipJhipsterDependencies;
    dest.withAdminUi = config.withAdminUi;
    dest.gatewayServerPort = config.gatewayServerPort;

    dest.capitalizedBaseName = config.capitalizedBaseName;
    dest.dasherizedBaseName = config.dasherizedBaseName;
    dest.humanizedBaseName = config.humanizedBaseName;
    dest.projectDescription = config.projectDescription;

    dest.testFrameworks = config.testFrameworks || [];

    dest.remotes =
      Object.entries(config.applications || {}).map(([baseName, remoteConfig]) => ({ baseName, ...(remoteConfig as any) })) || [];

    dest.gatlingTests = dest.testFrameworks.includes(GATLING);
    dest.cucumberTests = dest.testFrameworks.includes(CUCUMBER);
    dest.cypressTests = dest.testFrameworks.includes(CYPRESS);

    dest.authenticationType = config.authenticationType;
    dest.rememberMeKey = config.rememberMeKey;
    dest.jwtSecretKey = config.jwtSecretKey;
    dest.fakerSeed = config.fakerSeed;
    dest.skipUserManagement = config.skipUserManagement;
  }

  /**
   * @param {Object} dest - destination context to use default is context
   */
  loadDerivedMicroserviceAppConfig(dest: any = this) {
    dest.jhiPrefixCapitalized = _.upperFirst(dest.jhiPrefix);
    dest.jhiPrefixDashed = _.kebabCase(dest.jhiPrefix);
  }

  /**
   * @param {Object} dest - destination context to use default is context
   */
  loadDerivedAppConfig(dest: any = this) {
    (this as any).loadDerivedMicroserviceAppConfig(dest);
    dest.applicationTypeGateway = dest.applicationType === GATEWAY;
    dest.applicationTypeMonolith = dest.applicationType === MONOLITH;
    dest.applicationTypeMicroservice = dest.applicationType === MICROSERVICE;

    // Application name modified, using each technology's conventions
    if (dest.baseName) {
      dest.camelizedBaseName = _.camelCase(dest.baseName);
      dest.hipster = getHipster(dest.baseName);
      dest.capitalizedBaseName = dest.capitalizedBaseName || _.upperFirst(dest.baseName);
      dest.dasherizedBaseName = dest.dasherizedBaseName || _.kebabCase(dest.baseName);
      dest.lowercaseBaseName = dest.baseName.toLowerCase();
      dest.upperFirstCamelCaseBaseName = upperFirstCamelCase(dest.baseName);
      dest.humanizedBaseName =
        dest.humanizedBaseName || (dest.baseName.toLowerCase() === 'jhipster' ? 'JHipster' : _.startCase(dest.baseName));
      dest.projectDescription = dest.projectDescription || `Description for ${dest.baseName}`;
      dest.endpointPrefix = dest.applicationTypeMicroservice ? `services/${dest.lowercaseBaseName}` : '';
    }

    if (dest.microfrontends && dest.microfrontends.length > 0) {
      dest.microfrontends.forEach(microfrontend => {
        const { baseName } = microfrontend;
        microfrontend.lowercaseBaseName = baseName.toLowerCase();
        microfrontend.capitalizedBaseName = _.upperFirst(baseName);
        microfrontend.endpointPrefix = `services/${microfrontend.lowercaseBaseName}`;
      });
    } else if ((!dest.microfrontends || dest.microfrontends.length === 0) && dest.remotes) {
      dest.remotes.forEach(app => (this as any).loadDerivedAppConfig(app));
      dest.microfrontends = dest.remotes.filter(r => r.clientFramework && r.clientFramework !== CLIENT_FRAMEWORK_NO);
    }
    dest.microfrontend =
      dest.microfrontend ||
      (dest.applicationTypeMicroservice && !dest.skipClient) ||
      (dest.applicationTypeGateway && dest.microfrontends && dest.microfrontends.length > 0);

    if (dest.microfrontend && dest.applicationTypeMicroservice && !dest.gatewayServerPort) {
      dest.gatewayServerPort = 8080;
    }

    dest.authenticationTypeSession = dest.authenticationType === SESSION;
    dest.authenticationTypeJwt = dest.authenticationType === JWT;
    dest.authenticationTypeOauth2 = dest.authenticationType === OAUTH2;

    dest.generateAuthenticationApi = dest.applicationType === MONOLITH || dest.applicationType === GATEWAY;
    const authenticationApiWithUserManagement = dest.authenticationType !== OAUTH2 && dest.generateAuthenticationApi;
    dest.generateUserManagement = !dest.skipUserManagement && dest.databaseType !== NO_DATABASE && authenticationApiWithUserManagement;
    dest.generateInMemoryUserCredentials = !dest.generateUserManagement && authenticationApiWithUserManagement;

    // TODO make UserEntity optional on relationships for microservices and oauth2
    // TODO check if we support syncWithIdp using jwt authentication
    // Used for relationships and syncWithIdp
    const usesSyncWithIdp = dest.authenticationType === OAUTH2 && dest.databaseType !== NO_DATABASE;
    dest.generateBuiltInUserEntity = dest.generateUserManagement || usesSyncWithIdp;

    dest.generateBuiltInAuthorityEntity = dest.generateBuiltInUserEntity && dest.databaseType !== CASSANDRA;
  }

  /**
   * Load client configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadClientConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    dest.clientPackageManager = config.clientPackageManager;
    dest.clientFramework = config.clientFramework;
    dest.clientTheme = config.clientTheme;
    dest.clientThemeVariant = config.clientThemeVariant;
    dest.devServerPort = config.devServerPort;

    dest.clientSrcDir = config.clientSrcDir || CLIENT_MAIN_SRC_DIR;
    dest.clientTestDir = config.clientTestDir || CLIENT_TEST_SRC_DIR;
  }

  /**
   * @param {Object} dest - destination context to use default is context
   */
  loadDerivedClientConfig(dest: any = this) {
    dest.clientFrameworkAngular = dest.clientFramework === ANGULAR;
    dest.clientFrameworkReact = dest.clientFramework === REACT;
    dest.clientFrameworkVue = dest.clientFramework === VUE;
    dest.clientFrameworkNo = dest.clientFramework === CLIENT_FRAMEWORK_NO;
    dest.clientFrameworkAny = dest.clientFramework && dest.clientFramework !== CLIENT_FRAMEWORK_NO;
    if (dest.microfrontend === undefined) {
      if (dest.applicationTypeMicroservice) {
        dest.microfrontend = dest.clientFrameworkAny;
      } else if (dest.applicationTypeGateway) {
        dest.microfrontend = dest.microfrontends.length > 0;
      }
    }
    dest.clientThemeNone = dest.clientTheme === 'none';
    dest.clientThemePrimary = dest.clientThemeVariant === 'primary';
    dest.clientThemeLight = dest.clientThemeVariant === 'light';
    dest.clientThemeDark = dest.clientThemeVariant === 'dark';

    if (dest.baseName) {
      dest.frontendAppName = (this as any).getFrontendAppName(dest.baseName);
    }
  }

  /**
   * Load translation configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadTranslationConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    loadLanguagesConfig(dest, config);
  }

  /**
   * Load server configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {Object} config - config to load config from
   * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
   */
  loadServerConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    dest.packageName = config.packageName;
    dest.packageFolder = config.packageFolder && normalizePathEnd(config.packageFolder);
    dest.serverPort = config.serverPort;

    dest.srcMainJava = SERVER_MAIN_SRC_DIR;
    dest.srcMainResources = SERVER_MAIN_RES_DIR;
    dest.srcMainWebapp = CLIENT_MAIN_SRC_DIR;
    dest.srcTestJava = SERVER_TEST_SRC_DIR;
    dest.srcTestResources = SERVER_TEST_RES_DIR;
    dest.srcTestJavascript = CLIENT_TEST_SRC_DIR;

    dest.buildTool = config.buildTool;

    dest.databaseType = config.databaseType;
    dest.databaseMigration = config.databaseMigration;
    dest.devDatabaseType = config.devDatabaseType;
    dest.prodDatabaseType = config.prodDatabaseType;
    dest.incrementalChangelog = config.incrementalChangelog;
    dest.reactive = config.reactive;
    dest.searchEngine = config.searchEngine;
    dest.cacheProvider = config.cacheProvider;
    dest.enableHibernateCache = config.enableHibernateCache;
    dest.serviceDiscoveryType = config.serviceDiscoveryType;

    dest.enableSwaggerCodegen = config.enableSwaggerCodegen;
    dest.messageBroker = config.messageBroker;
    dest.websocket = config.websocket;
    dest.embeddableLaunchScript = config.embeddableLaunchScript;

    dest.enableGradleEnterprise = config.enableGradleEnterprise;

    if (config.gradleEnterpriseHost) {
      if (config.gradleEnterpriseHost.startsWith('https://')) {
        dest.gradleEnterpriseHost = config.gradleEnterpriseHost;
      } else {
        dest.gradleEnterpriseHost = `https://${config.gradleEnterpriseHost}`;
      }
    }
  }

  loadServerAndPlatformConfig(dest: any = this) {
    if (!dest.serviceDiscoveryType) {
      dest.serviceDiscoveryType = NO_SERVICE_DISCOVERY;
    }
    dest.serviceDiscoveryAny = dest.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
    dest.serviceDiscoveryConsul = dest.serviceDiscoveryType === CONSUL;
    dest.serviceDiscoveryEureka = dest.serviceDiscoveryType === EUREKA;
  }

  /**
   * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
   */
  loadDerivedServerConfig(dest: any = this) {
    if (!dest.packageFolder) {
      dest.packageFolder = `${dest.packageName.replace(/\./g, '/')}/`;
    }

    dest.javaPackageSrcDir = normalizePathEnd(`${dest.srcMainJava}${dest.packageFolder}`);
    dest.javaPackageTestDir = normalizePathEnd(`${dest.srcTestJava}${dest.packageFolder}`);

    if (!dest.websocket) {
      dest.websocket = NO_WEBSOCKET;
    }
    dest.communicationSpringWebsocket = dest.websocket === SPRING_WEBSOCKET;

    if (!dest.searchEngine) {
      dest.searchEngine = NO_SEARCH_ENGINE;
    }
    dest.searchEngineNo = dest.searchEngine === NO_SEARCH_ENGINE;
    dest.searchEngineAny = !dest.searchEngineNo;
    dest.searchEngineCouchbase = dest.searchEngine === COUCHBASE;
    dest.searchEngineElasticsearch = dest.searchEngine === ELASTICSEARCH;

    if (!dest.messageBroker) {
      dest.messageBroker = MESSAGE_BROKER_NO;
    }
    dest.messageBrokerKafka = dest.messageBroker === MESSAGE_BROKER_KAFKA;
    dest.messageBrokerPulsar = dest.messageBroker === MESSAGE_BROKER_PULSAR;
    dest.messageBrokerAny = dest.messageBroker && dest.messageBroker !== MESSAGE_BROKER_NO;

    dest.buildToolGradle = dest.buildTool === GRADLE;
    dest.buildToolMaven = dest.buildTool === MAVEN;
    dest.buildToolUnknown = !dest.buildToolGradle && !dest.buildToolMaven;

    dest.temporaryDir = dest.buildToolGradle ? 'build/' : 'target/';
    const buildDestinationDir = `${dest.temporaryDir}${dest.buildToolGradle ? 'resources/main/' : 'classes/'}`;
    dest.clientDistDir = `${buildDestinationDir}${CLIENT_DIST_DIR}`;

    dest.cacheProviderNo = !dest.cacheProvider || dest.cacheProvider === NO_CACHE;
    dest.cacheProviderCaffeine = dest.cacheProvider === CAFFEINE;
    dest.cacheProviderEhcache = dest.cacheProvider === EHCACHE;
    dest.cacheProviderHazelcast = dest.cacheProvider === HAZELCAST;
    dest.cacheProviderInfinispan = dest.cacheProvider === INFINISPAN;
    dest.cacheProviderMemcached = dest.cacheProvider === MEMCACHED;
    dest.cacheProviderRedis = dest.cacheProvider === REDIS;
    dest.cacheProviderAny = dest.cacheProvider && dest.cacheProvider !== NO_CACHE;

    dest.devDatabaseTypeH2Disk = dest.devDatabaseType === H2_DISK;
    dest.devDatabaseTypeH2Memory = dest.devDatabaseType === H2_MEMORY;
    dest.devDatabaseTypeH2Any = dest.devDatabaseTypeH2Disk || dest.devDatabaseTypeH2Memory;
    dest.devDatabaseTypeMariadb = dest.devDatabaseType === MARIADB;
    dest.devDatabaseTypeMssql = dest.devDatabaseType === MSSQL;
    dest.devDatabaseTypeMysql = dest.devDatabaseType === MYSQL;
    dest.devDatabaseTypeOracle = dest.devDatabaseType === ORACLE;
    dest.devDatabaseTypePostgres = dest.devDatabaseType === POSTGRESQL;

    dest.prodDatabaseTypeH2Disk = dest.prodDatabaseType === H2_DISK;
    dest.prodDatabaseTypeMariadb = dest.prodDatabaseType === MARIADB;
    dest.prodDatabaseTypeMssql = dest.prodDatabaseType === MSSQL;
    dest.prodDatabaseTypeMysql = dest.prodDatabaseType === MYSQL;
    dest.prodDatabaseTypeOracle = dest.prodDatabaseType === ORACLE;
    dest.prodDatabaseTypePostgres = dest.prodDatabaseType === POSTGRESQL;

    dest.databaseTypeNo = dest.databaseType === NO_DATABASE;
    dest.databaseTypeSql = dest.databaseType === SQL;
    dest.databaseTypeCassandra = dest.databaseType === CASSANDRA;
    dest.databaseTypeCouchbase = dest.databaseType === COUCHBASE;
    dest.databaseTypeMongodb = dest.databaseType === MONGODB;
    dest.databaseTypeNeo4j = dest.databaseType === NEO4J;
    dest.databaseTypeMysql = dest.databaseType === SQL && (dest.devDatabaseType === MYSQL || dest.prodDatabaseType === MYSQL);
    dest.databaseTypeMariadb = dest.databaseType === SQL && (dest.devDatabaseType === MARIADB || dest.prodDatabaseType === MARIADB);
    dest.databaseTypePostgres = dest.databaseType === SQL && (dest.devDatabaseType === POSTGRESQL || dest.prodDatabaseType === POSTGRESQL);
    dest.databaseTypeAny = !dest.databaseTypeNo;

    dest.databaseMigrationLiquibase = dest.databaseMigration ? dest.databaseMigration === 'liquibase' : dest.databaseType === SQL;

    dest.imperativeOrReactive = dest.reactive ? 'reactive' : 'imperative';

    dest.authenticationUsesCsrf = [OAUTH2, SESSION].includes(dest.authenticationType);

    if (dest.databaseTypeSql) {
      prepareSqlApplicationProperties(dest);
    }

    (this as any).loadServerAndPlatformConfig(dest);
  }

  /**
   * @param {Object} config - config to load config from
   * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
   */
  loadPlatformConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    dest.serviceDiscoveryType = config.serviceDiscoveryType;
    dest.monitoring = config.monitoring;
    (this as any).loadDerivedPlatformConfig(dest);
  }

  /**
   * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
   * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
   */
  loadDerivedPlatformConfig(dest: any = this) {
    dest.monitoringELK = dest.monitoring === ELK;
    dest.monitoringPrometheus = dest.monitoring === PROMETHEUS;
    (this as any).loadServerAndPlatformConfig(dest);
  }

  /**
   * @deprecated
   * Get all the generator configuration from the .yo-rc.json file
   * @param {string} yoRcPath - .yo-rc.json folder.
   */
  getJhipsterConfig(yoRcPath): Storage {
    return this.createStorage(yoRcPath, GENERATOR_JHIPSTER);
  }

  /**
   * JHipster config with default values fallback
   */
  get jhipsterConfigWithDefaults() {
    const configWithDefaults = getConfigWithDefaults(removeFieldsWithNullishValues(this.config.getAll()));
    _.defaults(configWithDefaults, {
      skipFakeData: false,
      skipCheckLengthOfIdentifier: false,
      enableGradleEnterprise: false,
      pages: [],
    });
    return configWithDefaults;
  }

  setConfigDefaults(defaults = this.jhipsterConfigWithDefaults) {
    const jhipsterVersion = packageJson.version;
    const baseName = getDefaultAppName(this);
    const creationTimestamp = new Date().getTime();

    this.config.defaults({
      ...defaults,
      jhipsterVersion,
      baseName,
      creationTimestamp,
    });
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
