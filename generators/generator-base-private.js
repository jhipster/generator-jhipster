/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const Insight = require('insight');
const shelljs = require('shelljs');
const semver = require('semver');
const exec = require('child_process').exec;
const https = require('https');
const jhiCore = require('jhipster-core');
const filter = require('gulp-filter');

const packagejs = require('../package.json');
const jhipsterUtils = require('./utils');
const constants = require('./generator-constants');
const {
    prettierTransform,
    prettierOptions
} = require('./generator-transforms');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

/**
 * This is the Generator base private class.
 * This provides all the private API methods used internally.
 * These methods should not be directly utilized using commonJS require,
 * as these can have breaking changes without a major version bumb
 *
 * The method signatures in private API can be changed without a major version change.
 */
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.env.options.appPath = this.config.get('appPath') || CLIENT_MAIN_SRC_DIR;
        // expose lodash to templates
        this._ = _;
    }

    /* ======================================================================== */
    /* private methods use within generator (not exposed to modules) */
    /* ======================================================================== */

    /**
     * Install I18N Client Files By Language
     *
     * @param {any} _this reference to generator
     * @param {string} webappDir web app directory
     * @param {string} lang language code
     */
    installI18nClientFilesByLanguage(_this, webappDir, lang) {
        const generator = _this || this;
        if (generator.databaseType !== 'no' && generator.databaseType !== 'cassandra') {
            generator.copyI18nFilesByName(generator, webappDir, 'audits.json', lang);
        }
        generator.copyI18nFilesByName(generator, webappDir, 'configuration.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'error.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'gateway.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'login.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'home.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'metrics.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'logs.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'password.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'register.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'sessions.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'settings.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'user-management.json', lang);

        // tracker.json for Websocket
        if (this.websocket === 'spring-websocket') {
            generator.copyI18nFilesByName(generator, webappDir, 'tracker.json', lang);
        }

        // Templates
        generator.template(`${webappDir}i18n/${lang}/activate.json.ejs`, `${webappDir}i18n/${lang}/activate.json`);
        generator.template(`${webappDir}i18n/${lang}/global.json.ejs`, `${webappDir}i18n/${lang}/global.json`);
        generator.template(`${webappDir}i18n/${lang}/health.json.ejs`, `${webappDir}i18n/${lang}/health.json`);
        generator.template(`${webappDir}i18n/${lang}/reset.json.ejs`, `${webappDir}i18n/${lang}/reset.json`);
    }

    /**
     * Install I18N Server Files By Language
     *
     * @param {any} _this - reference to generator
     * @param {string} resourceDir - resource directory
     * @param {string} lang - language code
     */
    installI18nServerFilesByLanguage(_this, resourceDir, lang) {
        const generator = _this || this;
        // Template the message server side properties
        const langProp = lang.replace(/-/g, '_');
        generator.template(`${resourceDir}i18n/messages_${langProp}.properties.ejs`, `${resourceDir}i18n/messages_${langProp}.properties`);
    }

    /**
     * Copy I18N
     *
     * @param language
     * @param prefix
     */
    copyI18n(language, prefix = '') {
        try {
            const fileName = this.entityTranslationKey;
            this.template(`${prefix ? `${prefix}/` : ''}i18n/entity_${language}.json.ejs`, `${CLIENT_MAIN_SRC_DIR}i18n/${language}/${fileName}.json`);
            this.addEntityTranslationKey(this.entityTranslationKeyMenu, this.entityClass, language);
        } catch (e) {
            this.debug('Error:', e);
            // An exception is thrown if the folder doesn't exist
            // do nothing
        }
    }

    /**
     * Copy Enum I18N
     *
     * @param language
     * @param enumInfo
     * @param prefix
     */
    copyEnumI18n(language, enumInfo, prefix = '') {
        try {
            this.template(`${prefix ? `${prefix}/` : ''}i18n/enum.json.ejs`, `${CLIENT_MAIN_SRC_DIR}i18n/${language}/${enumInfo.clientRootFolder}${enumInfo.enumInstance}.json`, this, {}, enumInfo);
        } catch (e) {
            this.debug('Error:', e);
            // An exception is thrown if the folder doesn't exist
            // do nothing
        }
    }

    /**
     * Update Languages In Language Constant
     *
     * @param languages
     */
    updateLanguagesInLanguageConstant(languages) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/components/language/language.constants.js`;
        try {
            let content = '.constant(\'LANGUAGES\', [\n';
            languages.forEach((language, i) => {
                content += `            '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '            // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n' +
                '        ]';

            jhipsterUtils.replaceContent({
                file: fullPath,
                pattern: /\.constant.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\]/g,
                content
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') + languages + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n'));
            this.debug('Error:', e);
        }
    }

    /**
     * Update Languages In Language Constant NG2
     *
     * @param languages
     */
    updateLanguagesInLanguageConstantNG2(languages) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/core/language/language.constants.ts`;
        try {
            let content = 'export const LANGUAGES: string[] = [\n';
            languages.forEach((language, i) => {
                content += `    '${language}'${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '    // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n' +
                '];';

            jhipsterUtils.replaceContent({
                file: fullPath,
                pattern: /export.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\];/g,
                content
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') + languages + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n'));
            this.debug('Error:', e);
        }
    }

    /**
     * Update Languages In Language Pipe
     *
     * @param languages
     */
    updateLanguagesInLanguagePipe(languages) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`;
        try {
            let content = '{\n';
            this.generateLanguageOptions(languages).forEach((ln, i) => {
                content += `        ${ln}${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '        // jhipster-needle-i18n-language-key-pipe - JHipster will add/remove languages in this object\n' +
                '    };';

            jhipsterUtils.replaceContent({
                file: fullPath,
                pattern: /{\s*('[a-z-]*':)?([^=]*jhipster-needle-i18n-language-key-pipe[^;]*)\};/g,
                content
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ') + languages + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n'));
            this.debug('Error:', e);
        }
    }

    /**
     * Update Languages In Webpack
     *
     * @param languages
     */
    updateLanguagesInWebpack(languages) {
        const fullPath = 'webpack/webpack.common.js';
        try {
            let content = 'groupBy: [\n';
            languages.forEach((language, i) => {
                content += `                    { pattern: "./src/main/webapp/i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '                    // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
                '                ]';

            jhipsterUtils.replaceContent({
                file: fullPath,
                pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
                content
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') + languages + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n'));
            this.debug('Error:', e);
        }
    }

    /**
     * insight
     *
     * @param trackingCode
     * @param packageName
     * @param packageVersion
     * @returns {Insight}
     */
    insight(trackingCode = 'UA-46075199-2', packageName = packagejs.name, packageVersion = packagejs.version) {
        const insight = new Insight({
            trackingCode,
            packageName,
            packageVersion
        });

        insight.trackWithEvent = (category, action) => {
            insight.track(category, action);
            insight.trackEvent({
                category,
                action,
                label: `${category} ${action}`,
                value: 1
            });
        };

        return insight;
    }

    /**
     * Remove File
     *
     * @param file
     */
    removeFile(file) {
        if (shelljs.test('-f', file)) {
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
        if (shelljs.test('-d', folder)) {
            this.log(`Removing the folder - ${folder}`);
            shelljs.rm('-rf', folder);
        }
    }

    /**
     * @returns default app name
     */
    getDefaultAppName() {
        return (/^[a-zA-Z0-9_]+$/.test(path.basename(process.cwd()))) ? path.basename(process.cwd()) : 'jhipster';
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
        let description = rows[0];
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
     * @param {any} input input
     * @returns {boolean} true if input is number; false otherwise
     */
    isNumber(input) {
        if (isNaN(this.filterNumber(input))) { // eslint-disable-line
            return false;
        }
        return true;
    }

    /**
     * @param {any} input input
     * @returns {boolean} true if input is a signed number; false otherwise
     */
    isSignedNumber(input) {
        if (isNaN(this.filterNumber(input, true))) { // eslint-disable-line
            return false;
        }
        return true;
    }

    /**
     * @param {any} input input
     * @returns {boolean} true if input is a signed decimal number; false otherwise
     */
    isSignedDecimalNumber(input) {
        if (isNaN(this.filterNumber(input, true, true))) { // eslint-disable-line
            return false;
        }
        return true;
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
     * Execute callback if git is installed
     *
     * @param {function} callback - function to be called if git is installed
     */
    isGitInstalled(callback) {
        this.gitExec('--version', { trace: false }, (code) => {
            if (code !== 0) {
                this.warning(
                    'git is not found on your computer.\n',
                    ` Install git: ${chalk.yellow('https://git-scm.com/')}`
                );
            }
            if (callback) callback(code);
        });
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
        array.forEach((value) => {
            if (_.includes(value, option)) {
                optionValue = value.split(':')[1];
            }
        });
        optionValue = optionValue === 'true' ? true : optionValue;
        return optionValue;
    }

    /**
     * get hibernate SnakeCase in JHipster preferred style.
     *
     * @param {string} value - table column name or table name string
     * @see org.springframework.boot.orm.jpa.hibernate.SpringNamingStrategy
     * @returns hibernate SnakeCase in JHipster preferred style
     */
    hibernateSnakeCase(value) {
        let res = '';
        if (value) {
            value = value.replace('.', '_');
            res = value[0];
            for (let i = 1, len = value.length - 1; i < len; i++) {
                if (value[i - 1] !== value[i - 1].toUpperCase() &&
                    value[i] !== value[i].toLowerCase() &&
                    value[i + 1] !== value[i + 1].toUpperCase()
                ) {
                    res += `_${value[i]}`;
                } else {
                    res += value[i];
                }
            }
            res += value[value.length - 1];
            res = res.toLowerCase();
        }
        return res;
    }

    /**
     * @param {Array} array - array to search in
     * @param {any} item - item to search for
     * @return {boolean} true if array contains item; false otherwise
     */
    contains(array, item) {
        return _.includes(array, item);
    }
    /**
     * Function to issue a https get request, and process the result
     *
     *  @param {string} url - the url to fetch
     *  @param {function} onSuccess - function, which gets called when the request succeeds, with the body of the response
     *  @param {function} onFail - callback when the get failed.
     */
    httpsGet(url, onSuccess, onFail) {
        https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                onSuccess(body);
            });
        }).on('error', onFail);
    }

    /**
     * Function to print a proper array with simple quoted strings
     *
     *  @param {array} array - the array to print
     */
    toArrayString(array) {
        return `['${array.join('\', \'')}']`;
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
        jhipsterUtils.renderContent(source, _this, _context, options, (res) => {
            _this.fs.write(_this.destinationPath(destination), res);
        });
    }

    /**
     * Utility function to copy files.
     *
     * @param {string} source - Original file.
     * @param {string} destination - The resulting file.
     */
    copy(source, destination) {
        this.fs.copy(this.templatePath(source), this.destinationPath(destination));
    }

    /**
     * Print a debug message.
     *
     * @param {string} msg - message to print
     * @param {string[]} args - arguments to print
     */
    debug(msg, ...args) {
        if (this.isDebugEnabled || (this.options && this.options.debug)) {
            this.log(`${chalk.yellow.bold('DEBUG!')} ${msg}`);
            args.forEach(arg => this.log(arg));
        }
    }

    /**
     * Compose external blueprint module
     * @param {string} blueprint - name of the blueprint
     * @param {string} subGen - sub generator
     * @param {any} options - options to pass to blueprint generator
     */
    composeBlueprint(blueprint, subGen, options = {}) {
        if (blueprint) {
            this.checkBlueprint(blueprint);
            try {
                this.useBlueprint = true;
                this.composeExternalModule(
                    blueprint,
                    subGen,
                    Object.assign(
                        { jhipsterContext: this },
                        options
                    )
                );
                return true;
            } catch (e) {
                this.debug('Error', e);
                this.warning(`No blueprint found for ${subGen} falling back to default generator`);
                return false;
            }
        }
        return false;
    }

    /**
     * Check if the generator specified as blueprint is installed.
     * @param {string} blueprint - generator name
     */
    checkBlueprint(blueprint) {
        if (blueprint === 'generator-jhipster') {
            this.error(`You cannot use ${chalk.yellow(blueprint)} as the blueprint.`);
        }
        const done = this.async();
        const localModule = path.join(process.cwd(), 'node_modules', blueprint);
        if (!fs.existsSync(localModule)) {
            shelljs.exec('yo --generators', { silent: true }, (err, stdout, stderr) => {
                if (!stdout.includes(` ${blueprint}\n`) && !stdout.includes(` ${blueprint.replace('generator-', '')}\n`)) {
                    this.error(`The ${chalk.yellow(blueprint)} blueprint provided is not installed. Please install it using command ${chalk.yellow(`npm i -g ${blueprint}`)}.`);
                }
                done();
            });
        } else {
            done();
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
                this.warning('Java 8 is not found on your computer.');
            } else {
                const javaVersion = stderr.match(/(?:java|openjdk) version "(.*)"/)[1];
                if (!javaVersion.match(new RegExp(constants.JAVA_VERSION.replace('.', '\\.')))) {
                    this.warning(`Java ${constants.JAVA_VERSION} is not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`);
                }
            }
            done();
        });
    }

    /**
     * Check if Node is installed
     */
    checkNode() {
        if (this.skipChecks || this.skipServer) return;
        const done = this.async();
        exec('node -v', (err, stdout, stderr) => {
            if (err) {
                this.warning('NodeJS is not found on your system.');
            } else {
                const nodeVersion = semver.clean(stdout);
                const nodeFromPackageJson = packagejs.engines.node;
                if (!semver.satisfies(nodeVersion, nodeFromPackageJson)) {
                    this.warning(`Your NodeJS version is too old (${nodeVersion}). You should use at least NodeJS ${chalk.bold(nodeFromPackageJson)}`);
                }
            }
            done();
        });
    }

    /**
     * Check if Git is installed
     */
    checkGit() {
        if (this.skipChecks || this.skipClient) return;
        const done = this.async();
        this.isGitInstalled((code) => {
            this.gitInstalled = code === 0;
            done();
        });
    }

    /**
     * Check if git connection can be established
     */
    checkGitConnection() {
        if (!this.gitInstalled) return;
        const done = this.async();
        exec('git ls-remote git://github.com/jhipster/generator-jhipster.git HEAD', { timeout: 15000 }, (error) => {
            if (error) {
                this.warning(`Failed to connect to "git://github.com"
1. Check your Internet connection.
2. If you are using an HTTP proxy, try this command: ${chalk.yellow('git config --global url."https://".insteadOf git://')}`);
            }
            done();
        });
    }

    /**
     * Check if Yarn is installed
     */
    checkYarn() {
        if (this.skipChecks || !this.useYarn) return;
        const done = this.async();
        exec('yarn --version', (err) => {
            if (err) {
                this.warning(
                    'yarn is not found on your computer.\n',
                    ' Using npm instead'
                );
                this.useYarn = false;
            } else {
                this.useYarn = true;
            }
            done();
        });
    }

    /**
     * Generate Entity Queries
     *
     * @param {Array|Object} relationships - array of relationships
     * @param {string} entityInstance - entity instance
     * @param {string} dto - dto
     * @returns {{queries: Array, variables: Array, hasManyToMany: boolean}}
     */
    generateEntityQueries(relationships, entityInstance, dto) {
        const queries = [];
        const variables = [];
        let hasManyToMany = false;
        relationships.forEach((relationship) => {
            let query;
            let variableName;
            hasManyToMany = hasManyToMany || relationship.relationshipType === 'many-to-many';
            if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true && relationship.otherEntityName !== 'user') {
                variableName = relationship.relationshipFieldNamePlural.toLowerCase();
                if (variableName === entityInstance) {
                    variableName += 'Collection';
                }
                const relationshipFieldName = `this.${entityInstance}.${relationship.relationshipFieldName}`;
                const relationshipFieldNameIdCheck = dto === 'no' ?
                    `!${relationshipFieldName} || !${relationshipFieldName}.id` :
                    `!${relationshipFieldName}Id`;

                query =
        `this.${relationship.otherEntityName}Service
            .query({filter: '${relationship.otherEntityRelationshipName.toLowerCase()}-is-null'})
            .subscribe((res: HttpResponse<I${relationship.otherEntityAngularName}[]>) => {
                if (${relationshipFieldNameIdCheck}) {
                    this.${variableName} = res.body;
                } else {
                    this.${relationship.otherEntityName}Service
                        .find(${relationshipFieldName}${dto === 'no' ? '.id' : 'Id'})
                        .subscribe((subRes: HttpResponse<I${relationship.otherEntityAngularName}>) => {
                            this.${variableName} = [subRes.body].concat(res.body);
                        }, (subRes: HttpErrorResponse) => this.onError(subRes.message));
                }
            }, (res: HttpErrorResponse) => this.onError(res.message));`;
            } else if (relationship.relationshipType !== 'one-to-many') {
                variableName = relationship.otherEntityNameCapitalizedPlural.toLowerCase();
                if (variableName === entityInstance) {
                    variableName += 'Collection';
                }
                query =
        `this.${relationship.otherEntityName}Service.query()
            .subscribe((res: HttpResponse<I${relationship.otherEntityAngularName}[]>) => { this.${variableName} = res.body; }, (res: HttpErrorResponse) => this.onError(res.message));`;
            }
            if (variableName && !this.contains(queries, query)) {
                queries.push(query);
                variables.push(`${variableName}: I${relationship.otherEntityAngularName}[];`);
            }
        });
        return {
            queries,
            variables,
            hasManyToMany
        };
    }

    /**
     * Generate Entity Client Field Default Values
     *
     * @param {Array|Object} fields - array of fields
     * @returns {Array} defaultVariablesValues
     */
    generateEntityClientFieldDefaultValues(fields) {
        const defaultVariablesValues = {};
        fields.forEach((field) => {
            const fieldType = field.fieldType;
            const fieldName = field.fieldName;
            if (fieldType === 'Boolean') {
                defaultVariablesValues[fieldName] = `this.${fieldName} = false;`;
            }
        });
        return defaultVariablesValues;
    }

    /**
     * Generate Entity Client Field Declarations
     *
     * @param {string} pkType - type of primary key
     * @param {Array|Object} fields - array of fields
     * @param {Array|Object} relationships - array of relationships
     * @param {string} dto - dto
     * @returns variablesWithTypes: Array
     */
    generateEntityClientFields(pkType, fields, relationships, dto) {
        const variablesWithTypes = [];
        let tsKeyType;
        if (pkType === 'String') {
            tsKeyType = 'string';
        } else {
            tsKeyType = 'number';
        }
        variablesWithTypes.push(`id?: ${tsKeyType}`);
        fields.forEach((field) => {
            const fieldType = field.fieldType;
            const fieldName = field.fieldName;
            let tsType;
            if (field.fieldIsEnum) {
                tsType = fieldType;
            } else if (fieldType === 'Boolean') {
                tsType = 'boolean';
            } else if (['Integer', 'Long', 'Float', 'Double', 'BigDecimal'].includes(fieldType)) {
                tsType = 'number';
            } else if (fieldType === 'String' || fieldType === 'UUID') {
                tsType = 'string';
            } else if (['LocalDate', 'Instant', 'ZonedDateTime'].includes(fieldType)) {
                tsType = 'Moment';
            } else { // (fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent === 'any' || (fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent === 'image' || fieldType === 'LocalDate'
                tsType = 'any';
                if (['byte[]', 'ByteBuffer'].includes(fieldType) && field.fieldTypeBlobContent !== 'text') {
                    variablesWithTypes.push(`${fieldName}ContentType?: string`);
                }
            }
            variablesWithTypes.push(`${fieldName}?: ${tsType}`);
        });

        relationships.forEach((relationship) => {
            let fieldType;
            let fieldName;
            const relationshipType = relationship.relationshipType;
            if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
                fieldType = `I${relationship.otherEntityAngularName}[]`;
                fieldName = relationship.relationshipFieldNamePlural;
            } else if (dto === 'no') {
                fieldType = `I${relationship.otherEntityAngularName}`;
                fieldName = relationship.relationshipFieldName;
            } else {
                const relationshipFieldName = relationship.relationshipFieldName;
                const relationshipFieldNamePlural = relationship.relationshipFieldNamePlural;
                const relationshipType = relationship.relationshipType;
                const otherEntityFieldCapitalized = relationship.otherEntityFieldCapitalized;
                const ownerSide = relationship.ownerSide;

                if (relationshipType === 'many-to-many' && ownerSide === true) {
                    fieldType = `I${otherEntityFieldCapitalized}[]`;
                    fieldName = relationshipFieldNamePlural;
                } else if (relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide === true)) {
                    if (otherEntityFieldCapitalized !== 'Id' && otherEntityFieldCapitalized !== '') {
                        fieldType = 'string';
                        fieldName = `${relationshipFieldName}${otherEntityFieldCapitalized}`;
                        variablesWithTypes.push(`${fieldName}?: ${fieldType}`);
                    }
                    fieldType = 'number';
                    fieldName = `${relationshipFieldName}Id`;
                } else {
                    fieldType = tsKeyType;
                    fieldName = `${relationship.relationshipFieldName}Id`;
                }
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
     * @returns typeImports: Map
     */
    generateEntityClientImports(relationships, dto, clientFramework = this.clientFramework) {
        const typeImports = new Map();
        relationships.forEach((relationship) => {
            const relationshipType = relationship.relationshipType;
            let toBeImported = false;
            if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
                toBeImported = true;
            } else if (dto === 'no') {
                toBeImported = true;
            } else {
                const ownerSide = relationship.ownerSide;

                if (relationshipType === 'many-to-many' && ownerSide === true) {
                    toBeImported = true;
                }
            }
            if (toBeImported) {
                const otherEntityAngularName = relationship.otherEntityAngularName;
                const importType = `I${otherEntityAngularName}`;
                let importPath;
                if (otherEntityAngularName === 'User') {
                    importPath = clientFramework === 'angularX' ? 'app/core/user/user.model' : './user.model';
                } else {
                    importPath = `./${relationship.otherEntityFileName}.model`;
                }
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
        if (constants.SQL_DB_OPTIONS.map(db => db.value).includes(db)) {
            return 'sql';
        }
        return db;
    }

    /**
     * @returns generated JDL from entities
     */
    generateJDLFromEntities() {
        const jdl = new jhiCore.JDLObject();
        try {
            const entities = {};
            this.getExistingEntities().forEach((entity) => { entities[entity.name] = entity.definition; });
            jhiCore.convertJsonEntitiesToJDL(entities, jdl);
            jhiCore.convertJsonServerOptionsToJDL({ 'generator-jhipster': this.config.getAll() }, jdl);
        } catch (e) {
            this.log(e.message || e);
            this.error('\nError while parsing entities to JDL\n');
        }
        return jdl;
    }

    /**
     * Generate language objects in array of "'en': { name: 'English' }" format
     * @param {string[]} languages
     * @returns generated language options
     */
    generateLanguageOptions(languages) {
        const selectedLangs = this.getAllSupportedLanguageOptions().filter(lang => languages.includes(lang.value));
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
     * Get UAA app name from path provided.
     * @param {string} input - path
     */
    getUaaAppName(input) {
        if (!input) return false;

        input = input.trim();
        let fromPath = '';
        if (path.isAbsolute(input)) {
            fromPath = `${input}/.yo-rc.json`;
        } else {
            fromPath = this.destinationPath(`${input}/.yo-rc.json`);
        }

        if (shelljs.test('-f', fromPath)) {
            const fileData = this.fs.readJSON(fromPath);
            if (fileData && fileData['generator-jhipster']) {
                return fileData['generator-jhipster'];
            } return false;
        }
        return false;
    }

    /**
     * Return the method name which converts the filter to specification
     * @param {string} fieldType
     */
    getSpecificationBuilder(fieldType) {
        if (['Integer', 'Long', 'Float', 'Double', 'BigDecimal', 'LocalDate', 'ZonedDateTime', 'Instant'].includes(fieldType)) {
            return 'buildRangeSpecification';
        }
        if (fieldType === 'String') {
            return 'buildStringSpecification';
        }
        return 'buildSpecification';
    }

    /**
     * @param {string} fieldType
     * @returns {boolean} true if type is filterable; false otherwise.
     */
    isFilterableType(fieldType) {
        return !(['byte[]', 'ByteBuffer'].includes(fieldType));
    }

    /**
     * Copy Filtering Flag
     *
     * @param {any} from - from
     * @param {any} to - to
     * @param {any} context - generator context
     */
    copyFilteringFlag(from, to, context = this) {
        if (context.databaseType === 'sql' && context.service !== 'no') {
            to.jpaMetamodelFiltering = from.jpaMetamodelFiltering;
        } else {
            to.jpaMetamodelFiltering = false;
        }
    }

    /**
     * Rebuild client for Angular
     */
    rebuildClient() {
        const done = this.async();
        this.log(`\n${chalk.bold.green('Running `webpack:build` to update client app\n')}`);
        this.spawnCommand(this.clientPackageManager, ['run', 'webpack:build']).on('close', () => {
            done();
        });
    }

    /**
     * Generate a primary key, according to the type
     *
     * @param {any} pkType - the type of the primary key
     * @param {any} prodDatabaseType - the database type
     */
    generateTestEntityId(pkType, prodDatabaseType) {
        if (pkType === 'String') {
            if (prodDatabaseType === 'cassandra') {
                return '\'9fec3727-3421-4967-b213-ba36557ca194\'';
            }
            return '\'123\'';
        }
        return 123;
    }

    /**
     * Decide the primary key type based on DB
     *
     * @param {any} databaseType - the database type
     */
    getPkType(databaseType) {
        if (['cassandra', 'mongodb', 'couchbase'].includes(databaseType)) {
            return 'String';
        }
        return 'Long';
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
        if (clientRootFolder) {
            return '../';
        }
        return '';
    }

    /**
     * Register file transforms for client side files
     * @param {any} generator
     */
    registerClientTransforms(generator = this) {
        if (!generator.skipClient) {
            // Prettier is clever, it uses correct rules and correct parser according to file extension.
            const prettierFilter = filter(['src/**/*.{ts,tsx,scss,css}'], { restore: true });
            // this pipe will pass through (restore) anything that doesn't match typescriptFilter
            generator.registerTransformStream([
                prettierFilter,
                prettierTransform(prettierOptions),
                prettierFilter.restore
            ]);
        }
    }
};
