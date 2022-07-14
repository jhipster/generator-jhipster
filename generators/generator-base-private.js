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

const path = require('path');
const _ = require('lodash');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const shelljs = require('shelljs');
const semver = require('semver');
const exec = require('child_process').exec;
const https = require('https');

const { reproducibleConfigForTests: projectNameReproducibleConfigForTests } = require('./project-name/config.cjs');
const packagejs = require('../package.json');
const jhipsterUtils = require('./utils');
const { JAVA_COMPATIBLE_VERSIONS, SERVER_TEST_SRC_DIR, SUPPORTED_CLIENT_FRAMEWORKS } = require('./generator-constants');
const { languageToJavaLanguage } = require('./utils');
const JSONToJDLEntityConverter = require('../jdl/converters/json-to-jdl-entity-converter');
const JSONToJDLOptionConverter = require('../jdl/converters/json-to-jdl-option-converter');
const { stringify } = require('../utils');
const { fieldIsEnum } = require('../utils/field');
const { databaseData } = require('./sql-constants');

const { ANGULAR, REACT, VUE } = SUPPORTED_CLIENT_FRAMEWORKS;
const dbTypes = require('../jdl/jhipster/field-types');
const { REQUIRED } = require('../jdl/jhipster/validations');

const {
  STRING: TYPE_STRING,
  INTEGER: TYPE_INTEGER,
  LONG: TYPE_LONG,
  BIG_DECIMAL: TYPE_BIG_DECIMAL,
  FLOAT: TYPE_FLOAT,
  DOUBLE: TYPE_DOUBLE,
  UUID: TYPE_UUID,
  BOOLEAN: TYPE_BOOLEAN,
  LOCAL_DATE: TYPE_LOCAL_DATE,
  ZONED_DATE_TIME: TYPE_ZONED_DATE_TIME,
  INSTANT: TYPE_INSTANT,
  DURATION: TYPE_DURATION,
} = dbTypes.CommonDBTypes;

const TYPE_BYTES = dbTypes.RelationalOnlyDBTypes.BYTES;
const TYPE_BYTE_BUFFER = dbTypes.RelationalOnlyDBTypes.BYTE_BUFFER;

const databaseTypes = require('../jdl/jhipster/database-types');

const { MONGODB, NEO4J, COUCHBASE, CASSANDRA, SQL, ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, H2_DISK, H2_MEMORY } = databaseTypes;

const { MAVEN } = require('../jdl/jhipster/build-tool-types');

/**
 * This is the Generator base private class.
 * This provides all the private API methods used internally.
 * These methods should not be directly utilized using commonJS require,
 * as these can have breaking changes without a major version bump
 *
 * The method signatures in private API can be changed without a major version change.
 */
module.exports = class JHipsterBasePrivateGenerator extends Generator {
  constructor(args, options, features) {
    super(args, options, features);
    // expose lodash to templates
    this._ = _;
  }

  /* ======================================================================== */
  /* private methods use within generator (not exposed to modules) */
  /* ======================================================================== */

  /**
   * Override yeoman generator's usage function to fine tune --help message.
   */
  usage() {
    return super.usage().replace('yo jhipster:', 'jhipster ');
  }

  /**
   * Override yeoman generator's destinationPath to apply custom output dir.
   */
  destinationPath(...paths) {
    paths = path.join(...paths);
    paths = this.applyOutputPathCustomizer(paths);
    return paths ? super.destinationPath(paths) : paths;
  }

  /**
   * Install I18N Server Files By Language
   *
   * @param {any} _this - reference to generator
   * @param {string} resourceDir - resource directory
   * @param {string} lang - language code
   * @param {string} testResourceDir - test resource directory
   */
  installI18nServerFilesByLanguage(_this, resourceDir, lang, testResourceDir) {
    const generator = _this || this;
    const prefix = this.fetchFromInstalledJHipster('languages/templates');
    const langJavaProp = languageToJavaLanguage(lang);
    generator.template(
      `${prefix}/${resourceDir}i18n/messages_${langJavaProp}.properties.ejs`,
      `${resourceDir}i18n/messages_${langJavaProp}.properties`
    );
    if (!this.skipUserManagement) {
      generator.template(
        `${prefix}/${testResourceDir}i18n/messages_${langJavaProp}.properties.ejs`,
        `${testResourceDir}i18n/messages_${langJavaProp}.properties`
      );
    }
  }

  /**
   * Update Languages In Language Constant
   *
   * @param languages
   */
  updateLanguagesInLanguageConstant(languages) {
    const fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/components/language/language.constants.js`;
    try {
      let content = ".constant('LANGUAGES', [\n";
      languages.forEach((language, i) => {
        content += `            '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '            // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n        ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /\.constant.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Language Constant NG2
   *
   * @param languages
   */
  updateLanguagesInLanguageConstantNG2(languages) {
    if (this.clientFramework !== ANGULAR) {
      return;
    }
    const fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/config/language.constants.ts`;
    try {
      let content = 'export const LANGUAGES: string[] = [\n';
      languages.forEach((language, i) => {
        content += `    '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '    // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n];';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /export.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\];/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In MailServiceIT
   *
   * @param languages
   * @param packageFolder
   */
  updateLanguagesInLanguageMailServiceIT(languages, packageFolder) {
    const fullPath = `${SERVER_TEST_SRC_DIR}${packageFolder}/service/MailServiceIT.java`;
    try {
      let content = 'private static final String[] languages = {\n';
      languages.forEach((language, i) => {
        content += `        "${language}"${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '        // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n    };';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /private.*static.*String.*languages.*\{([^}]*jhipster-needle-i18n-language-constant[^}]*)\};/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Language Pipe
   *
   * @param languages
   */
  updateLanguagesInLanguagePipe(languages) {
    const fullPath =
      this.clientFramework === ANGULAR
        ? `${this.CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`
        : `${this.CLIENT_MAIN_SRC_DIR}/app/config/translation.ts`;
    try {
      let content = '{\n';
      this.generateLanguageOptions(languages, this.clientFramework).forEach((ln, i) => {
        content += `        ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
      });
      content += '        // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n    };';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /{\s*('[a-z-]*':)?([^=]*jhipster-needle-i18n-language-key-pipe[^;]*)\};/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Webpack
   *
   * @param languages
   */
  updateLanguagesInWebpackAngular(languages) {
    const fullPath = 'webpack/webpack.custom.js';
    try {
      let content = 'groupBy: [\n';
      // prettier-ignore
      languages.forEach((language, i) => {
                content += `                    { pattern: "./${this.CLIENT_MAIN_SRC_DIR}i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
      content +=
        '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
        '                ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update Languages In Webpack React
   *
   * @param languages
   */
  updateLanguagesInWebpackReact(languages) {
    const fullPath = 'webpack/webpack.common.js';
    try {
      let content = 'groupBy: [\n';
      // prettier-ignore
      languages.forEach((language, i) => {
                content += `                    { pattern: "./${this.CLIENT_MAIN_SRC_DIR}i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
      content +=
        '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
        '                ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Update DayJS Locales to keep in dayjs.ts config file
   *
   * @param languages
   */
  updateLanguagesInDayjsConfiguation(languages) {
    let fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/config/dayjs.ts`;
    if (this.clientFramework === VUE) {
      fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/shared/config/dayjs.ts`;
    } else if (this.clientFramework === ANGULAR) {
      fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/config/dayjs.ts`;
    }
    try {
      const content = languages.reduce(
        (content, language) =>
          `${content}import 'dayjs/${this.clientFrameworkAngular ? 'esm/' : ''}locale/${this.getDayjsLocaleId(language)}'\n`,
        '// jhipster-needle-i18n-language-dayjs-imports - JHipster will import languages from dayjs here\n'
      );

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          // match needle until // DAYJS CONFIGURATION (excluded)
          pattern: /\/\/ jhipster-needle-i18n-language-dayjs-imports[\s\S]+?(?=\/\/ DAYJS CONFIGURATION)/g,
          content: `${content}\n`,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. DayJS language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Remove File
   *
   * @param file
   */
  removeFile(file) {
    file = this.destinationPath(file);
    if (file && shelljs.test('-f', file)) {
      this.log(`Removing the file - ${file}`);
      shelljs.rm(file);
    }
  }

  /**
   * Remove Folder
   *
   * @param folder
   */
  removeFolder(folder) {
    folder = this.destinationPath(folder);
    if (folder && shelljs.test('-d', folder)) {
      this.log(`Removing the folder - ${folder}`);
      shelljs.rm('-rf', folder);
    }
  }

  /**
   * Execute a git mv.
   *
   * @param {string} source
   * @param {string} dest
   * @returns {boolean} true if success; false otherwise
   */
  gitMove(source, dest) {
    source = this.destinationPath(source);
    dest = this.destinationPath(dest);
    if (source && dest && shelljs.test('-f', source)) {
      this.info(`Renaming the file - ${source} to ${dest}`);
      return !shelljs.exec(`git mv -f ${source} ${dest}`).code;
    }
    return true;
  }

  /**
   * @returns default app name
   */
  getDefaultAppName() {
    if (this.options.reproducible) {
      return projectNameReproducibleConfigForTests.baseName;
    }
    return /^[a-zA-Z0-9_-]+$/.test(path.basename(process.cwd()))
      ? path.basename(process.cwd()).replace('generator-jhipster-', '')
      : 'jhipster';
  }

  /**
   * Format As Class Javadoc
   *
   * @param {string} text - text to format
   * @returns class javadoc
   */
  formatAsClassJavadoc(text) {
    return jhipsterUtils.getJavadoc(text, 0);
  }

  /**
   * Format As Field Javadoc
   *
   * @param {string} text - text to format
   * @returns field javadoc
   */
  formatAsFieldJavadoc(text) {
    return jhipsterUtils.getJavadoc(text, 4);
  }

  /**
   * Format As Api Description
   *
   * @param {string} text - text to format
   * @returns formatted api description
   */
  formatAsApiDescription(text) {
    if (!text) {
      return text;
    }
    const rows = text.split('\n');
    let description = this.formatLineForJavaStringUse(rows[0]);
    for (let i = 1; i < rows.length; i++) {
      // discard empty rows
      if (rows[i].trim() !== '') {
        // if simple text then put space between row strings
        if (!description.endsWith('>') && !rows[i].startsWith('<')) {
          description += ' ';
        }
        description += this.formatLineForJavaStringUse(rows[i]);
      }
    }
    return description;
  }

  formatLineForJavaStringUse(text) {
    if (!text) {
      return text;
    }
    return text.replace(/"/g, '\\"');
  }

  /**
   * Format As Liquibase Remarks
   *
   * @param {string} text - text to format
   * @param {boolean} addRemarksTag - add remarks tag
   * @returns formatted liquibase remarks
   */
  formatAsLiquibaseRemarks(text, addRemarksTag = false) {
    if (!text) {
      return addRemarksTag ? '' : text;
    }
    const rows = text.split('\n');
    let description = rows[0];
    for (let i = 1; i < rows.length; i++) {
      // discard empty rows
      if (rows[i].trim() !== '') {
        // if simple text then put space between row strings
        if (!description.endsWith('>') && !rows[i].startsWith('<')) {
          description += ' ';
        }
        description += rows[i];
      }
    }
    // escape & to &amp;
    description = description.replace(/&/g, '&amp;');
    // escape " to &quot;
    description = description.replace(/"/g, '&quot;');
    // escape ' to &apos;
    description = description.replace(/'/g, '&apos;');
    // escape < to &lt;
    description = description.replace(/</g, '&lt;');
    // escape > to &gt;
    description = description.replace(/>/g, '&gt;');
    return addRemarksTag ? ` remarks="${description}"` : description;
  }

  /**
   * Parse creationTimestamp option
   * @returns {number} representing the milliseconds elapsed since January 1, 1970, 00:00:00 UTC
   *                   obtained by parsing the given string representation of the creationTimestamp.
   */
  parseCreationTimestamp(creationTimestampOption = this.options.creationTimestamp) {
    let creationTimestamp;
    if (creationTimestampOption) {
      creationTimestamp = Date.parse(creationTimestampOption);
      if (!creationTimestamp) {
        this.warning(`Error parsing creationTimestamp ${creationTimestampOption}.`);
      } else if (creationTimestamp > new Date().getTime()) {
        this.error(`Creation timestamp should not be in the future: ${creationTimestampOption}.`);
      }
    }
    return creationTimestamp;
  }

  /**
   * @param {any} input input
   * @returns {boolean} true if input is number; false otherwise
   */
  isNumber(input) {
    return !isNaN(this.filterNumber(input));
  }

  /**
   * @param {any} input input
   * @returns {boolean} true if input is a signed number; false otherwise
   */
  isSignedNumber(input) {
    return !isNaN(this.filterNumber(input, true));
  }

  /**
   * @param {any} input input
   * @returns {boolean} true if input is a signed decimal number; false otherwise
   */
  isSignedDecimalNumber(input) {
    return !isNaN(this.filterNumber(input, true, true));
  }

  /**
   * Filter Number
   *
   * @param {string} input - input to filter
   * @param isSigned - flag indicating whether to check for signed number or not
   * @param isDecimal - flag indicating whether to check for decimal number or not
   * @returns {number} parsed number if valid input; <code>NaN</code> otherwise
   */
  filterNumber(input, isSigned, isDecimal) {
    const signed = isSigned ? '(\\-|\\+)?' : '';
    const decimal = isDecimal ? '(\\.[0-9]+)?' : '';
    const regex = new RegExp(`^${signed}([0-9]+${decimal})$`);

    if (regex.test(input)) return Number(input);

    return NaN;
  }

  /**
   * Checks if git is installed.
   *
   * @param {function} callback[optional] - function to be called after checking if git is installed. The callback will receive the code of the shell command executed.
   *
   * @return {boolean} true if installed; false otherwise.
   */
  isGitInstalled(callback) {
    const gitInstalled = jhipsterUtils.isGitInstalled(callback);
    if (!gitInstalled) {
      this.warning('git is not found on your computer.\n', ` Install git: ${chalk.yellow('https://git-scm.com/')}`);
    }
    return gitInstalled;
  }

  /**
   * Initialize git repository.
   */
  initializeGitRepository() {
    if (this.gitInstalled || this.isGitInstalled()) {
      const gitDir = this.gitExec('rev-parse --is-inside-work-tree', { trace: false }).stdout;
      // gitDir has a line break to remove (at least on windows)
      if (gitDir && gitDir.trim() === 'true') {
        this.gitInitialized = true;
      } else {
        const shellStr = this.gitExec('init', { trace: false });
        this.gitInitialized = shellStr.code === 0;
        if (this.gitInitialized) this.log(chalk.green.bold('Git repository initialized.'));
        else this.warning(`Failed to initialize Git repository.\n ${shellStr.stderr}`);
      }
    } else {
      this.warning('Git repository could not be initialized, as Git is not installed on your system');
    }
  }

  /**
   * Commit pending files to git.
   */
  commitFilesToGit(commitMsg, done) {
    if (this.gitInitialized) {
      this.debug('Committing files to git');
      this.gitExec('log --oneline -n 1 -- .', { trace: false }, (code, commits) => {
        if (code !== 0 || !commits || !commits.trim()) {
          // if no files in Git from current folder then we assume that this is initial application generation
          this.gitExec('add .', { trace: false }, code => {
            if (code === 0) {
              this.gitExec(`commit --no-verify -m "${commitMsg}" -- .`, { trace: false }, code => {
                if (code === 0) {
                  this.log(chalk.green.bold(`Application successfully committed to Git from ${process.cwd()}.`));
                } else {
                  this.log(chalk.red.bold(`Application commit to Git failed from ${process.cwd()}. Try to commit manually.`));
                }
                done();
              });
            } else {
              this.warning(`The generated application could not be committed to Git, because ${chalk.bold('git add')} command failed.`);
              done();
            }
          });
        } else {
          // if found files in Git from current folder then we assume that this is application regeneration
          // if there are changes in current folder then inform user about manual commit needed
          this.gitExec('diff --name-only .', { trace: false }, (code, diffs) => {
            if (code === 0 && diffs && diffs.trim()) {
              this.log(
                `Found commits in Git from ${process.cwd()}. So we assume this is application regeneration. Therefore automatic Git commit is not done. You can do Git commit manually.`
              );
            }
            done();
          });
        }
      });
    } else {
      this.warning('The generated application could not be committed to Git, as a Git repository could not be initialized.');
      done();
    }
  }

  /**
   * Get Option From Array
   *
   * @param {Array} array - array
   * @param {any} option - options
   * @returns {boolean} true if option is in array and is set to 'true'
   */
  getOptionFromArray(array, option) {
    let optionValue = false;
    array.forEach(value => {
      if (_.includes(value, option)) {
        optionValue = value.split(':')[1];
      }
    });
    optionValue = optionValue === 'true' ? true : optionValue;
    return optionValue;
  }

  /**
   * Function to issue a https get request, and process the result
   *
   *  @param {string} url - the url to fetch
   *  @param {function} onSuccess - function, which gets called when the request succeeds, with the body of the response
   *  @param {function} onFail - callback when the get failed.
   */
  httpsGet(url, onSuccess, onFail) {
    https
      .get(url, res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          onSuccess(body);
        });
      })
      .on('error', onFail);
  }

  /**
   * Strip margin indicated by pipe `|` from a string literal
   *
   *  @param {string} content - the string to process
   */
  stripMargin(content) {
    return content.replace(/^[ ]*\|/gm, '');
  }

  /**
   * Utility function to copy and process templates.
   *
   * @param {string} source - source
   * @param {string} destination - destination
   * @param {*} generator - reference to the generator
   * @param {*} options - options object
   * @param {*} context - context
   */
  template(source, destination, generator, options = {}, context) {
    const _this = generator || this;
    const _context = context || _this;
    const customDestination = _this.destinationPath(destination);
    if (!customDestination) {
      this.debug(`File ${destination} ignored`);
      return Promise.resolved();
    }
    return jhipsterUtils
      .renderContent(source, _this, _context, options)
      .then(res => {
        _this.fs.write(customDestination, res);
        return customDestination;
      })
      .catch(error => {
        this.warning(source);
        throw error;
      });
  }

  /**
   * Utility function to render a template into a string
   *
   * @param {string} source - source
   * @param {function} callback - callback to take the rendered template as a string
   * @param {*} generator - reference to the generator
   * @param {*} options - options object
   * @param {*} context - context
   */
  render(source, callback, generator, options = {}, context) {
    const _this = generator || this;
    const _context = context || _this;
    jhipsterUtils.renderContent(source, _this, _context, options, res => {
      callback(res);
    });
  }

  /**
   * Utility function to copy files.
   *
   * @param {string} source - Original file.
   * @param {string} destination - The resulting file.
   */
  copy(source, destination) {
    const customDestination = this.destinationPath(destination);
    if (!customDestination) {
      this.debug(`File ${destination} ignored`);
      return;
    }
    this.fs.copy(this.templatePath(source), customDestination);
  }

  /**
   * Print a debug message.
   *
   * @param {string} msg - message to print
   * @param {string[]} args - arguments to print
   */
  debug(msg, ...args) {
    const formattedMsg = `${chalk.yellow.bold('DEBUG!')} ${msg}`;
    if ((this.configOptions && this.configOptions.isDebugEnabled) || (this.options && this.options.debug)) {
      this.log(formattedMsg);
      args.forEach(arg => this.log(arg));
    }
    if (this._debug && this._debug.enabled) {
      this._debug(formattedMsg);
      args.forEach(arg => this._debug(arg));
    }
  }

  /**
   * Check if Java is installed
   */
  checkJava() {
    if (this.skipChecks || this.skipServer) return;
    const done = this.async();
    exec('java -version', (err, stdout, stderr) => {
      if (err) {
        this.warning('Java is not found on your computer.');
      } else {
        const javaVersion = stderr.match(/(?:java|openjdk) version "(.*)"/)[1];
        if (!javaVersion.match(new RegExp(`(${JAVA_COMPATIBLE_VERSIONS.map(ver => `^${ver}`).join('|')})`))) {
          const [latest, ...others] = JAVA_COMPATIBLE_VERSIONS.concat().reverse();
          this.warning(
            `Java ${others.reverse().join(', ')} or ${latest} are not found on your computer. Your Java version is: ${chalk.yellow(
              javaVersion
            )}`
          );
        }
      }
      done();
    });
  }

  /**
   * Check if Node is installed
   */
  checkNode() {
    if (this.skipChecks) return;
    const nodeFromPackageJson = packagejs.engines.node;
    if (!semver.satisfies(process.version, nodeFromPackageJson)) {
      this.warning(
        `Your NodeJS version is too old (${process.version}). You should use at least NodeJS ${chalk.bold(nodeFromPackageJson)}`
      );
    }
    if (!(process.release || {}).lts) {
      this.warning(
        'Your Node version is not LTS (Long Term Support), use it at your own risk! JHipster does not support non-LTS releases, so if you encounter a bug, please use a LTS version first.'
      );
    }
  }

  /**
   * Check if Git is installed
   */
  checkGit() {
    if (this.skipChecks || this.skipClient) return;
    this.gitInstalled = this.isGitInstalled();
  }

  /**
   * Generate Entity Client Field Default Values
   *
   * @param {Array|Object} fields - array of fields
   * @param [clientFramework]
   * @returns {Array} defaultVariablesValues
   */
  generateEntityClientFieldDefaultValues(fields, clientFramework = ANGULAR) {
    const defaultVariablesValues = {};
    fields.forEach(field => {
      const fieldType = field.fieldType;
      const fieldName = field.fieldName;
      if (fieldType === TYPE_BOOLEAN) {
        if (clientFramework === REACT) {
          defaultVariablesValues[fieldName] = `${fieldName}: false,`;
        } else {
          defaultVariablesValues[fieldName] = `this.${fieldName} = this.${fieldName} ?? false;`;
        }
      }
    });
    return defaultVariablesValues;
  }

  /**
   * Find key type for Typescript
   *
   * @param {string | object} primaryKey - primary key definition
   * @returns {string} primary key type in Typescript
   */
  getTypescriptKeyType(primaryKey) {
    if (typeof primaryKey === 'object') {
      primaryKey = primaryKey.type;
    }
    if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(primaryKey)) {
      return 'number';
    }
    return 'string';
  }

  /**
   * Find type for Typescript
   *
   * @param {string} fieldType - field type
   * @returns {string} field type in Typescript
   */
  getTypescriptType(fieldType) {
    if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(fieldType)) {
      return 'number';
    }
    if ([TYPE_LOCAL_DATE, TYPE_ZONED_DATE_TIME, TYPE_INSTANT].includes(fieldType)) {
      return 'dayjs.Dayjs';
    }
    if ([TYPE_BOOLEAN].includes(fieldType)) {
      return 'boolean';
    }
    if (fieldIsEnum(fieldType)) {
      return fieldType;
    }
    return 'string';
  }

  /**
   * Generate Entity Client Field Declarations
   *
   * @param {string} primaryKey - primary key definition
   * @param {Array|Object} fields - array of fields
   * @param {Array|Object} relationships - array of relationships
   * @param {string} dto - dto
   * @param [customDateType]
   * @param {boolean} embedded - either the actual entity is embedded or not
   * @returns variablesWithTypes: Array
   */
  generateEntityClientFields(primaryKey, fields, relationships, dto, customDateType = 'dayjs.Dayjs', embedded = false) {
    const variablesWithTypes = [];
    if (!embedded && primaryKey) {
      const tsKeyType = this.getTypescriptKeyType(primaryKey);
      if (this.jhipsterConfig.clientFramework === VUE) {
        variablesWithTypes.push(`id?: ${tsKeyType}`);
      }
    }
    fields.forEach(field => {
      const fieldType = field.fieldType;
      const fieldName = field.fieldName;
      const nullable = !field.id && field.nullable;
      let tsType = 'any';
      if (field.fieldIsEnum) {
        tsType = fieldType;
      } else if (fieldType === TYPE_BOOLEAN) {
        tsType = 'boolean';
      } else if ([TYPE_INTEGER, TYPE_LONG, TYPE_FLOAT, TYPE_DOUBLE, TYPE_BIG_DECIMAL].includes(fieldType)) {
        tsType = 'number';
      } else if ([TYPE_STRING, TYPE_UUID, TYPE_DURATION, TYPE_BYTES, TYPE_BYTE_BUFFER].includes(fieldType)) {
        tsType = 'string';
        if ([TYPE_BYTES, TYPE_BYTE_BUFFER].includes(fieldType) && field.fieldTypeBlobContent !== 'text') {
          variablesWithTypes.push(`${fieldName}ContentType?: ${nullable ? 'string | null' : 'string'}`);
        }
      } else if ([TYPE_LOCAL_DATE, TYPE_INSTANT, TYPE_ZONED_DATE_TIME].includes(fieldType)) {
        tsType = customDateType;
      }
      if (nullable) {
        tsType += ' | null';
      }
      variablesWithTypes.push(`${fieldName}?: ${tsType}`);
    });

    relationships.forEach(relationship => {
      let fieldType;
      let fieldName;
      const nullable = !relationship.relationshipValidateRules || !relationship.relationshipValidateRules.includes(REQUIRED);
      const relationshipType = relationship.relationshipType;
      if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
        fieldType = `I${relationship.otherEntityAngularName}[]`;
        fieldName = relationship.relationshipFieldNamePlural;
      } else {
        fieldType = `I${relationship.otherEntityAngularName}`;
        fieldName = relationship.relationshipFieldName;
      }
      if (nullable) {
        fieldType += ' | null';
      }
      variablesWithTypes.push(`${fieldName}?: ${fieldType}`);
    });
    return variablesWithTypes;
  }

  /**
   * Generate Entity Client Imports
   *
   * @param {Array|Object} relationships - array of relationships
   * @param {string} dto - dto
   * @param {string} clientFramework the client framework, 'angularX' or 'react'.
   * @returns typeImports: Map
   */
  generateEntityClientImports(relationships, dto, clientFramework = this.clientFramework) {
    const typeImports = new Map();
    relationships.forEach(relationship => {
      const otherEntityAngularName = relationship.otherEntityAngularName;
      const importType = `I${otherEntityAngularName}`;
      let importPath;
      if (this.isBuiltInUser(otherEntityAngularName)) {
        importPath = clientFramework === ANGULAR ? 'app/entities/user/user.model' : 'app/shared/model/user.model';
      } else {
        importPath =
          clientFramework === ANGULAR
            ? `app/entities/${relationship.otherEntityClientRootFolder}${relationship.otherEntityFolderName}/${relationship.otherEntityFileName}.model`
            : `app/shared/model/${relationship.otherEntityClientRootFolder}${relationship.otherEntityFileName}.model`;
      }
      typeImports.set(importType, importPath);
    });
    return typeImports;
  }

  /**
   * Generate Entity Client Enum Imports
   *
   * @param {Array|Object} fields - array of the entity fields
   * @param {string} clientFramework the client framework, 'angularX' or 'react'.
   * @returns typeImports: Map
   */
  generateEntityClientEnumImports(fields, clientFramework = this.clientFramework) {
    const typeImports = new Map();
    const uniqueEnums = {};
    fields.forEach(field => {
      const { enumFileName, fieldType } = field;
      if (field.fieldIsEnum && (!uniqueEnums[fieldType] || (uniqueEnums[fieldType] && field.fieldValues.length !== 0))) {
        const importType = `${fieldType}`;
        const basePath = clientFramework === VUE ? '@' : 'app';
        const modelPath = clientFramework === ANGULAR ? 'entities' : 'shared/model';
        const importPath = `${basePath}/${modelPath}/enumerations/${enumFileName}.model`;
        uniqueEnums[fieldType] = field.fieldType;
        typeImports.set(importType, importPath);
      }
    });
    return typeImports;
  }

  /**
   * Get DB type from DB value
   * @param {string} db - db
   */
  getDBTypeFromDBValue(db) {
    return jhipsterUtils.getDBTypeFromDBValue(db);
  }

  /**
   * Get build directory used by buildTool
   * @param {string} buildTool - buildTool
   */
  getBuildDirectoryForBuildTool(buildTool) {
    return buildTool === MAVEN ? 'target/' : 'build/';
  }

  /**
   * Get resource build directory used by buildTool
   * @param {string} buildTool - buildTool
   */
  getResourceBuildDirectoryForBuildTool(buildTool) {
    return buildTool === MAVEN ? 'target/classes/' : 'build/resources/main/';
  }

  /**
   * @returns generated JDL from entities
   */
  generateJDLFromEntities() {
    let jdlObject;
    const entities = new Map();
    try {
      this.getExistingEntities().forEach(entity => {
        entities.set(entity.name, entity.definition);
      });
      jdlObject = JSONToJDLEntityConverter.convertEntitiesToJDL({ entities });
      JSONToJDLOptionConverter.convertServerOptionsToJDL({ 'generator-jhipster': this.config.getAll() }, jdlObject);
    } catch (error) {
      this.log(error.message || error);
      this.error('\nError while parsing entities to JDL\n');
    }
    return jdlObject;
  }

  /**
   * Generate language objects in array of "'en': { name: 'English' }" format
   * @param {string[]} languages
   * @param clientFramework
   * @returns generated language options
   */
  generateLanguageOptions(languages, clientFramework) {
    const selectedLangs = this.getAllSupportedLanguageOptions().filter(lang => languages.includes(lang.value));
    if (clientFramework === REACT) {
      return selectedLangs.map(lang => `'${lang.value}': { name: '${lang.dispName}'${lang.rtl ? ', rtl: true' : ''} }`);
    }

    return selectedLangs.map(lang => `'${lang.value}': { name: '${lang.dispName}'${lang.rtl ? ', rtl: true' : ''} }`);
  }

  /**
   * Check if language should be skipped for locale setting
   * @param {string} language
   */
  skipLanguageForLocale(language) {
    const out = this.getAllSupportedLanguageOptions().filter(lang => language === lang.value);
    return out && out[0] && !!out[0].skipForLocale;
  }

  /**
   * Return the method name which converts the filter to specification
   * @param {string} fieldType
   */
  getSpecificationBuilder(fieldType) {
    if (
      [
        TYPE_INTEGER,
        TYPE_LONG,
        TYPE_FLOAT,
        TYPE_DOUBLE,
        TYPE_BIG_DECIMAL,
        TYPE_LOCAL_DATE,
        TYPE_ZONED_DATE_TIME,
        TYPE_INSTANT,
        TYPE_DURATION,
      ].includes(fieldType)
    ) {
      return 'buildRangeSpecification';
    }
    if (fieldType === TYPE_STRING) {
      return 'buildStringSpecification';
    }
    return 'buildSpecification';
  }

  /**
   * @param {string} fieldType
   * @returns {boolean} true if type is filterable; false otherwise.
   */
  isFilterableType(fieldType) {
    return ![TYPE_BYTES, TYPE_BYTE_BUFFER].includes(fieldType);
  }

  /**
   * Rebuild client for Angular
   */
  rebuildClient() {
    const done = this.async();
    this.log(`\n${chalk.bold.green('Running `webapp:build` to update client app\n')}`);
    this.spawnCommand(this.clientPackageManager, ['run', 'webapp:build']).on('close', () => {
      done();
    });
  }

  /**
   * Generate a primary key, according to the type
   *
   * @param {any} primaryKey - primary key definition
   * @param {number} index - the index of the primary key, currently it's possible to generate 2 values, index = 0 - first key (default), otherwise second key
   * @param {boolean} [wrapped=true] - wrapped values for required types.
   */
  generateTestEntityId(primaryKey, index = 0, wrapped = true) {
    if (typeof primaryKey === 'object') {
      primaryKey = primaryKey.type;
    }
    let value;
    if (primaryKey === TYPE_STRING) {
      value = index === 0 ? 'ABC' : 'CBA';
    } else if (primaryKey === TYPE_UUID) {
      value = index === 0 ? '9fec3727-3421-4967-b213-ba36557ca194' : '1361f429-3817-4123-8ee3-fdf8943310b2';
    } else {
      value = index === 0 ? 123 : 456;
    }
    if (wrapped && [TYPE_UUID, TYPE_STRING].includes(primaryKey)) {
      return `'${value}'`;
    }
    return value;
  }

  /**
   * Generate a test entity, according to the type
   *
   * @param {any} primaryKey - primary key definition.
   * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
   */
  generateTestEntityPrimaryKey(primaryKey, index) {
    return JSON.stringify(
      this.generateTestEntity(
        primaryKey.fields.map(f => f.reference),
        index
      )
    );
  }

  /**
   * Generate a test entity, according to the references
   *
   * @param references
   * @param additionalFields
   * @return {String} test sample
   */
  generateTypescriptTestEntity(references, additionalFields = {}) {
    const entries = references
      .map(reference => {
        if (reference.field) {
          const field = reference.field;
          const { fieldIsEnum, fieldType, fieldTypeTimed, fieldTypeLocalDate, fieldWithContentType, fieldName, contentTypeFieldName } =
            field;

          const fakeData = field.generateFakeData('ts');
          if (fieldWithContentType) {
            return [
              [fieldName, fakeData],
              [contentTypeFieldName, "'unknown'"],
            ];
          }
          if (fieldIsEnum) {
            return [[fieldName, `${fieldType}[${fakeData}]`]];
          }
          if (fieldTypeTimed || fieldTypeLocalDate) {
            return [[fieldName, `dayjs(${fakeData})`]];
          }
          return [[fieldName, fakeData]];
        }
        return [[reference.name, this.generateTestEntityId(reference.type, 'random', false)]];
      })
      .flat();
    return `{
  ${[...entries, ...Object.entries(additionalFields)].map(([key, value]) => `${key}: ${value}`).join(',\n  ')}
}`;
  }

  /**
   * Generate a test entity, according to the type
   *
   * @param references
   * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
   */
  generateTestEntity(references, index = 'random') {
    const random = index === 'random';
    const entries = references
      .map(reference => {
        if (random && reference.field) {
          const field = reference.field;
          const fakeData = field.generateFakeData('json-serializable');
          if (reference.field.fieldWithContentType) {
            return [
              [reference.name, fakeData],
              [field.contentTypeFieldName, 'unknown'],
            ];
          }
          return [[reference.name, fakeData]];
        }
        return [[reference.name, this.generateTestEntityId(reference.type, index, false)]];
      })
      .flat();
    return Object.fromEntries(entries);
  }

  /**
   * Return the primary key data type based on DB
   *
   * @param {any} databaseType - the database type
   */
  getPkType(databaseType) {
    if (this.jhipsterConfig.pkType) {
      return this.jhipsterConfig.pkType;
    }
    if ([MONGODB, NEO4J, COUCHBASE].includes(databaseType)) {
      return TYPE_STRING;
    }
    if (databaseType === CASSANDRA) {
      return TYPE_UUID;
    }
    return TYPE_LONG;
  }

  /**
   * Returns the URL for a particular databaseType and protocol
   *
   * @param {string} databaseType
   * @param {string} protocol
   * @param {*} options
   */
  getDBCUrl(databaseType, protocol, options = {}) {
    if (!protocol) {
      throw new Error('protocol is required');
    }
    const { databaseName } = options;
    if (!databaseName) {
      throw new Error("option 'databaseName' is required");
    }
    if ([MYSQL, MARIADB, POSTGRESQL, ORACLE, MSSQL].includes(databaseType) && !options.hostname) {
      throw new Error(`option 'hostname' is required for ${databaseType} databaseType`);
    } else if (![MYSQL, MARIADB, POSTGRESQL, ORACLE, MSSQL, H2_DISK, H2_MEMORY].includes(databaseType)) {
      throw new Error(`${databaseType} databaseType is not supported`);
    }
    let databaseDataForType = databaseData[databaseType];
    if (databaseDataForType[protocol]) {
      databaseDataForType = {
        ...databaseDataForType,
        ...databaseDataForType[protocol],
      };
    }
    const { protocolSuffix = '', extraOptions = '', useDirectory = false } = databaseDataForType;
    let { port = '' } = databaseDataForType;
    if (useDirectory && !options.localDirectory) {
      throw new Error(`'localDirectory' option should be provided for ${databaseType} databaseType`);
    }
    const databaseHasHost = options.hostname;
    if (options.itests && H2_MEMORY === databaseType) {
      port = ':12344';
    }
    let url = `${protocol}:${protocolSuffix}`;
    if (options.localDirectory) {
      url += `${options.localDirectory}/`;
    } else {
      url += databaseHasHost ? options.hostname : databaseName;
      url += port;
    }
    if (databaseHasHost || options.localDirectory) {
      url += databaseName;
    }
    return `${url}${options.skipExtraOptions ? '' : extraOptions}`;
  }

  getDBCExtraOption(databaseType) {
    const databaseDataForType = databaseData[databaseType];
    const { extraOptions = '' } = databaseDataForType;
    return extraOptions;
  }

  /**
   * Returns the primary key value based on the primary key type, DB and default value
   *
   * @param {string} primaryKey - the primary key type
   * @param {string} databaseType - the database type
   * @param {string} defaultValue - default value
   * @returns {string} java primary key value
   */
  getPrimaryKeyValue(primaryKey, databaseType = this.jhipsterConfig.databaseType, defaultValue = 1) {
    if (typeof primaryKey === 'object' && primaryKey.composite) {
      return `new ${primaryKey.type}(${primaryKey.references
        .map(ref => this.getPrimaryKeyValue(ref.type, databaseType, defaultValue))
        .join(', ')})`;
    }
    const primaryKeyType = typeof primaryKey === 'string' ? primaryKey : primaryKey.type;
    if (primaryKeyType === TYPE_STRING) {
      if (databaseType === SQL && defaultValue === 0) {
        return this.getJavaValueGeneratorForType(primaryKeyType);
      }
      return `"id${defaultValue}"`;
    }
    if (primaryKeyType === TYPE_UUID) {
      return this.getJavaValueGeneratorForType(primaryKeyType);
    }
    return `${defaultValue}L`;
  }

  getJavaValueGeneratorForType(type) {
    if (type === 'String') {
      return 'UUID.randomUUID().toString()';
    }
    if (type === 'UUID') {
      return 'UUID.randomUUID()';
    }
    if (type === 'Long') {
      return 'count.incrementAndGet()';
    }
    throw new Error(`Java type ${type} does not have a random generator implemented`);
  }

  /**
   * Get a root folder name for entity
   * @param {string} clientRootFolder
   * @param {string} entityFileName
   */
  getEntityFolderName(clientRootFolder, entityFileName) {
    if (clientRootFolder) {
      return `${clientRootFolder}/${entityFileName}`;
    }
    return entityFileName;
  }

  /**
   * Get a parent folder path addition for entity
   * @param {string} clientRootFolder
   */
  getEntityParentPathAddition(clientRootFolder) {
    if (!clientRootFolder) {
      return '';
    }
    const relative = path.relative(`/app/entities/${clientRootFolder}/`, '/app/entities/');
    if (relative.includes('app')) {
      // Relative path outside angular base dir.
      const message = `
                "clientRootFolder outside app base dir '${clientRootFolder}'"
            `;
      // Test case doesn't have a environment instance so return 'error'
      if (this.env === undefined) {
        throw new Error(message);
      }
      this.error(message);
    }
    const entityFolderPathAddition = relative.replace(/[/|\\]?..[/|\\]entities/, '').replace('entities', '..');
    if (!entityFolderPathAddition) {
      return '';
    }
    return `${entityFolderPathAddition}/`;
  }

  /**
   * Check if the subgenerator has been invoked from JHipster CLI or from Yeoman (yo jhipster:subgenerator)
   */
  checkInvocationFromCLI() {
    if (!this.options.fromCli) {
      this.warning(
        `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
          'jhipster <command>'
        )} instead of ${chalk.red('yo jhipster:<command>')}`
      );
    }
  }

  vueUpdateLanguagesInTranslationStore(languages) {
    const fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/shared/config/store/translation-store.ts`;
    try {
      let content = 'languages: {\n';
      if (this.enableTranslation) {
        this.generateLanguageOptions(languages, this.clientFramework).forEach((ln, i) => {
          content += `      ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
        });
      }
      content += '      // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n    }';
      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /languages:.*\{([^\]]*jhipster-needle-i18n-language-key-pipe[^}]*)}/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  vueUpdateI18nConfig(languages) {
    const fullPath = `${this.CLIENT_MAIN_SRC_DIR}app/shared/config/config.ts`;

    try {
      // Add i18n config snippets for all languages
      let i18nConfig = 'const dateTimeFormats: DateTimeFormats = {\n';
      if (this.enableTranslation) {
        languages.forEach((ln, i) => {
          i18nConfig += this.generateDateTimeFormat(ln, i, languages.length);
        });
      }
      i18nConfig += '  // jhipster-needle-i18n-language-date-time-format - JHipster will add/remove format options in this object\n';
      i18nConfig += '}';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /const dateTimeFormats.*\{([^\]]*jhipster-needle-i18n-language-date-time-format[^}]*)}/g,
          content: i18nConfig,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  vueUpdateLanguagesInWebpack(languages) {
    const fullPath = 'webpack/webpack.common.js';
    try {
      let content = 'groupBy: [\n';
      // prettier-ignore
      languages.forEach((language, i) => {
                content += `          { pattern: './${this.CLIENT_MAIN_SRC_DIR}i18n/${language}/*.json', fileName: './i18n/${language}.json' }${
                    i !== languages.length - 1 ? ',' : ''
                }\n`;
            });
      content += '          // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n        ]';

      jhipsterUtils.replaceContent(
        {
          file: fullPath,
          pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
          content,
        },
        this
      );
    } catch (e) {
      this.log(
        chalk.yellow('\nUnable to find ') +
          fullPath +
          chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') +
          languages +
          chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
      );
      this.debug('Error:', e);
    }
  }

  generateDateTimeFormat(language, index, length) {
    let config = `  '${language}': {\n`;

    config += '    short: {\n';
    config += "      year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'\n";
    config += '    },\n';
    config += '    medium: {\n';
    config += "      year: 'numeric', month: 'short', day: 'numeric',\n";
    config += "      weekday: 'short', hour: 'numeric', minute: 'numeric'\n";
    config += '    },\n';
    config += '    long: {\n';
    config += "      year: 'numeric', month: 'long', day: 'numeric',\n";
    config += "      weekday: 'long', hour: 'numeric', minute: 'numeric'\n";
    config += '    }\n';
    config += '  }';
    if (index !== length - 1) {
      config += ',';
    }
    config += '\n';
    return config;
  }

  /**
   * Convert to Java bean name case
   *
   * Handle the specific case when the second letter is capitalized
   * See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
   *
   * @param {string} beanName
   * @return {string}
   */
  javaBeanCase(beanName) {
    const secondLetter = beanName.charAt(1);
    if (secondLetter && secondLetter === secondLetter.toUpperCase()) {
      return beanName;
    }
    return _.upperFirst(beanName);
  }

  /**
   * Create a java getter of reference.
   *
   * @param {object|string[]} reference
   * @return {string}
   */
  buildJavaGet(reference) {
    let refPath;
    if (typeof refPath === 'string') {
      refPath = [reference];
    } else if (Array.isArray(reference)) {
      refPath = reference;
    } else {
      refPath = [reference.name];
    }
    return refPath.map(partialPath => `get${this.javaBeanCase(partialPath)}()`).join('.');
  }

  /**
   * Create a dotted path of reference.
   *
   * @param {object|string[]} reference
   * @return {string}
   */
  buildReferencePath(reference) {
    const refPath = Array.isArray(reference) ? reference : reference.path;
    return refPath.join('.');
  }

  /**
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} type
   * @return {string}
   */
  buildJavaGetter(reference, type = reference.type) {
    return `${type} get${this.javaBeanCase(reference.name)}()`;
  }

  /**
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} valueDefinition
   * @return {string}
   */
  buildJavaSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return `set${this.javaBeanCase(reference.name)}(${valueDefinition})`;
  }

  /**
   * Create a java getter method of reference.
   *
   * @param {object} reference
   * @param {string} valueDefinition
   * @return {string}
   */
  buildJavaFluentSetter(reference, valueDefinition = `${reference.type} ${reference.name}`) {
    return `${reference.name}(${valueDefinition})`;
  }

  /**
   * Create a angular form path getter method of reference.
   *
   * @param {object} reference
   * @param {string[]} prefix
   * @return {string}
   */
  buildAngularFormPath(reference, prefix = []) {
    const formPath = [...prefix, ...reference.path].join("', '");
    return `'${formPath}'`;
  }

  /**
   * @private
   *
   * Print entity json representation.
   *
   * @param {object} entity
   */
  debugEntity(entity) {
    this.log(stringify(entity));
  }
};
