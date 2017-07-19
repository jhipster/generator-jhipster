/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const Insight = require('insight');
const shelljs = require('shelljs');
const semver = require('semver');
const exec = require('child_process').exec;
const https = require('https');
const jhiCore = require('jhipster-core');

const packagejs = require('../package.json');
const jhipsterUtils = require('./utils');
const constants = require('./generator-constants');

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
    }

    /*= =======================================================================*/
    /* private methods use within generator (not exposed to modules)*/
    /*= =======================================================================*/

    installI18nClientFilesByLanguage(_this, webappDir, lang) {
        const generator = _this || this;
        generator.copyI18nFilesByName(generator, webappDir, 'audits.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'configuration.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'error.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'gateway.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'login.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'logs.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'home.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'metrics.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'password.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'register.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'sessions.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'settings.json', lang);
        generator.copyI18nFilesByName(generator, webappDir, 'user-management.json', lang);

        // tracker.json for Websocket
        if (this.websocket === 'spring-websocket') {
            generator.copyI18nFilesByName(generator, webappDir, 'tracker.json', lang);
        }

        if (this.enableSocialSignIn) {
            generator.copyI18nFilesByName(generator, webappDir, 'social.json', lang);
        }

        // Templates
        generator.template(`${webappDir}i18n/${lang}/_activate.json`, `${webappDir}i18n/${lang}/activate.json`);
        generator.template(`${webappDir}i18n/${lang}/_global.json`, `${webappDir}i18n/${lang}/global.json`);
        generator.template(`${webappDir}i18n/${lang}/_health.json`, `${webappDir}i18n/${lang}/health.json`);
        generator.template(`${webappDir}i18n/${lang}/_reset.json`, `${webappDir}i18n/${lang}/reset.json`);
    }

    installI18nServerFilesByLanguage(_this, resourceDir, lang) {
        const generator = _this || this;
        // Template the message server side properties
        const langProp = lang.replace(/-/g, '_');
        generator.template(`${resourceDir}i18n/_messages_${langProp}.properties`, `${resourceDir}i18n/messages_${langProp}.properties`);
    }

    copyI18n(language, prefix) {
        try {
            this.template(`${prefix}/i18n/_entity_${language}.json`, `${CLIENT_MAIN_SRC_DIR}i18n/${language}/${this.entityInstance}.json`);
            this.addEntityTranslationKey(this.entityTranslationKeyMenu, this.entityClass, language);
        } catch (e) {
            // An exception is thrown if the folder doesn't exist
            // do nothing
        }
    }

    copyEnumI18n(language, enumInfo, prefix) {
        try {
            this.template(`${prefix}/i18n/_enum.json`, `${CLIENT_MAIN_SRC_DIR}i18n/${language}/${enumInfo.enumInstance}.json`, this, {}, enumInfo);
        } catch (e) {
            // An exception is thrown if the folder doesn't exist
            // do nothing
        }
    }

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
        }
    }

    updateLanguagesInLanguageConstantNG2(languages) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/shared/language/language.constants.ts`;
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
        }
    }

    updateLanguagesInLanguagePipe(languages) {
        let fullPath = `${CLIENT_MAIN_SRC_DIR}app/shared/language/find-language-from-key.pipe.ts`;
        if (this.clientFramework === 'angular1') {
            fullPath = `${CLIENT_MAIN_SRC_DIR}app/components/language/language.filter.js`;
        }
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
        }
    }

    updateLanguagesInWebpack(languages) {
        const fullPath = 'webpack/webpack.common.js';
        try {
            let content = 'groupBy: [\n';
            languages.forEach((language, i) => {
                content += `                        { pattern: "./src/main/webapp/i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${i !== languages.length - 1 ? ',' : ''}\n`;
            });
            content +=
                '                        // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array\n' +
                '                    ]';

            jhipsterUtils.replaceContent({
                file: fullPath,
                pattern: /groupBy:.*\[([^\]]*jhipster-needle-i18n-language-webpack[^\]]*)\]/g,
                content
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ') + languages + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n'));
        }
    }

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

    removeFile(file) {
        if (shelljs.test('-f', file)) {
            this.log(`Removing the file - ${file}`);
            shelljs.rm(file);
        }
    }

    removeFolder(folder) {
        if (shelljs.test('-d', folder)) {
            this.log(`Removing the folder - ${folder}`);
            shelljs.rm('-rf', folder);
        }
    }

    getDefaultAppName() {
        return (/^[a-zA-Z0-9_]+$/.test(path.basename(process.cwd()))) ? path.basename(process.cwd()) : 'jhipster';
    }

    formatAsClassJavadoc(text) {
        return jhipsterUtils.getJavadoc(text, 0);
    }

    formatAsFieldJavadoc(text) {
        return jhipsterUtils.getJavadoc(text, 4);
    }

    formatAsApiDescription(text) {
        const rows = text.split('\n');
        let description = rows[0];
        for (let i = 1; i < rows.length; i++) {
            // discard empty rows
            if (rows[i] !== '') {
                // if simple text then put space between row strings
                if (!description.endsWith('>') && !rows[i].startsWith('<')) {
                    description += ' ';
                }
                description += rows[i];
            }
        }
        return description;
    }

    isNumber(input) {
        if (isNaN(this.filterNumber(input))) {
            return false;
        }
        return true;
    }

    isSignedNumber(input) {
        if (isNaN(this.filterNumber(input, true))) {
            return false;
        }
        return true;
    }

    isSignedDecimalNumber(input) {
        if (isNaN(this.filterNumber(input, true, true))) {
            return false;
        }
        return true;
    }

    filterNumber(input, isSigned, isDecimal) {
        const signed = isSigned ? '(\\-|\\+)?' : '';
        const decimal = isDecimal ? '(\\.[0-9]+)?' : '';
        const regex = new RegExp(`^${signed}([0-9]+${decimal})$`);

        if (regex.test(input)) return Number(input);

        return NaN;
    }

    isGitInstalled(callback) {
        this.gitExec('--version', (code) => {
            if (code !== 0) {
                this.warning('git is not found on your computer.\n',
                    ` Install git: ${chalk.yellow('https://git-scm.com/')}`
                );
            }
            if (callback) callback(code);
        });
    }

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

    contains(array, item) {
        return _.includes(array, item);
    }
    /**
     * Function to issue a https get request, and process the result
     *
     *  @param {string} url - the url to fetch
     *  @param onSuccess - function, which gets called when the request succeeds, with the body of the response
     *  @param onFail - callback when the get failed.
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
     */
    stripMargin(content) {
        return content.replace(/^[ ]*\|/gm, '');
    }

    /**
     * Utility function to copy and process templates.
     *
     * @param {string} source
     * @param {string} destination
     * @param {*} generator
     * @param {*} options
     * @param {*} context
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
     * @param {string} value - message to print
     */
    debug(msg) {
        this.log(`${chalk.yellow.bold('DEBUG!')} ${msg}`);
    }

    checkJava() {
        if (this.skipChecks || this.skipServer) return;
        const done = this.async();
        exec('java -version', (err, stdout, stderr) => {
            if (err) {
                this.warning('Java 8 is not found on your computer.');
            } else {
                const javaVersion = stderr.match(/(?:java|openjdk) version "(.*)"/)[1];
                if (!javaVersion.match(/1\.8/)) {
                    this.warning(`Java 8 is not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`);
                }
            }
            done();
        });
    }

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

    checkGit() {
        if (this.skipChecks || this.skipClient) return;
        const done = this.async();
        this.isGitInstalled((code) => {
            this.gitInstalled = code === 0;
            done();
        });
    }

    checkGitConnection() {
        if (!this.gitInstalled) return;
        const done = this.async();
        exec('git ls-remote git://github.com/jhipster/generator-jhipster.git HEAD', { timeout: 15000 }, (error) => {
            if (error) {
                this.warning(`Failed to connect to "git://github.com"
                     1. Check your Internet connection.
                     2. If you are using an HTTP proxy, try this command: ${chalk.yellow('git config --global url."https://".insteadOf git://')}`
                );
            }
            done();
        });
    }

    checkYarn() {
        if (this.skipChecks || !this.useYarn) return;
        const done = this.async();
        exec('yarn --version', (err) => {
            if (err) {
                this.warning('yarn is not found on your computer.\n',
                    ' Using npm instead');
                this.useYarn = false;
            } else {
                this.useYarn = true;
            }
            done();
        });
    }

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
            .subscribe((res: ResponseWrapper) => {
                if (${relationshipFieldNameIdCheck}) {
                    this.${variableName} = res.json;
                } else {
                    this.${relationship.otherEntityName}Service
                        .find(${relationshipFieldName}${dto === 'no' ? '.id' : 'Id'})
                        .subscribe((subRes: ${relationship.otherEntityAngularName}) => {
                            this.${variableName} = [subRes].concat(res.json);
                        }, (subRes: ResponseWrapper) => this.onError(subRes.json));
                }
            }, (res: ResponseWrapper) => this.onError(res.json));`;
            } else if (relationship.relationshipType !== 'one-to-many') {
                variableName = relationship.otherEntityNameCapitalizedPlural.toLowerCase();
                if (variableName === entityInstance) {
                    variableName += 'Collection';
                }
                query =
        `this.${relationship.otherEntityName}Service.query()
            .subscribe((res: ResponseWrapper) => { this.${variableName} = res.json; }, (res: ResponseWrapper) => this.onError(res.json));`;
            }
            if (variableName && !this.contains(queries, query)) {
                queries.push(query);
                variables.push(`${variableName}: ${relationship.otherEntityAngularName}[];`);
            }
        });
        return {
            queries,
            variables,
            hasManyToMany
        };
    }

    /**
     * Get DB type from DB value
     * @param {string} db
     */
    getDBTypeFromDBValue(db) {
        if (constants.SQL_DB_OPTIONS.map(db => db.value).includes(db)) {
            return 'sql';
        }
        return db;
    }

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
     */
    generateLanguageOptions(languages) {
        const selectedLangs = this.getAllSupportedLanguageOptions().filter(lang => languages.includes(lang.value));
        return selectedLangs.map(
            lang => `'${lang.value}': { name: '${lang.dispName}'${lang.rtl ? ', rtl: true' : ''} }`
        );
    }

    /**
     * Check if language should be skipped for locale setting
     * @param {string} language
     */
    skipLanguageForLocale(language) {
        const out = this.getAllSupportedLanguageOptions().filter(lang => language === lang.value);
        return out && out[0] && !!out[0].skipForLocale;
    }
};
