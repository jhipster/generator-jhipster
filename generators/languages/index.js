const util = require('util');
const generator = require('yeoman-generator');
const chalk = require('chalk');
const _ = require('lodash');
const BaseGenerator = require('../generator-base');

const constants = require('../generator-constants');

const LanguagesGenerator = generator.extend({});

util.inherits(LanguagesGenerator, BaseGenerator);

let configOptions = {};

module.exports = LanguagesGenerator.extend({
    constructor: function (...args) { // eslint-disable-line object-shorthand
        generator.apply(this, args);

        configOptions = this.options.configOptions || {};

        // This makes it possible to pass `languages` by argument
        this.argument('languages', {
            type: Array,
            required: false,
            description: 'Languages'
        });

        // This adds support for a `--skip-client` flag
        this.option('skip-client', {
            desc: 'Skip installing client files',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-server` flag
        this.option('skip-server', {
            desc: 'Skip installing server files',
            type: Boolean,
            defaults: false
        });

        this.skipClient = this.options['skip-client'] || this.config.get('skipClient');
        this.skipServer = this.options['skip-server'] || this.config.get('skipServer');
        // Validate languages passed as argument
        this.languages = this.options.languages;
        if (this.languages) {
            this.languages.forEach((language) => {
                if (!this.isSupportedLanguage(language)) {
                    this.log('\n');
                    this.error(chalk.red(
                        `Unsupported language "${language}" passed as argument to language generator.` +
                        `\nSupported languages: ${_.map(this.getAllSupportedLanguageOptions(),
                        o => `\n  ${_.padEnd(o.value, 5)} (${o.name})`).join('')}`
                    ));
                }
            });
        }
    },
    initializing: {
        getConfig() {
            if (this.languages) {
                if (this.skipClient) {
                    this.log(chalk.bold(`\nInstalling languages: ${this.languages.join(', ')} for server`));
                } else if (this.skipServer) {
                    this.log(chalk.bold(`\nInstalling languages: ${this.languages.join(', ')} for client`));
                } else {
                    this.log(chalk.bold(`\nInstalling languages: ${this.languages.join(', ')}`));
                }
                this.languagesToApply = this.languages || [];
            } else {
                this.log(chalk.bold('\nLanguages configuration is starting'));
            }
            this.applicationType = this.config.get('applicationType');
            this.baseName = this.config.get('baseName');
            this.capitalizedBaseName = _.upperFirst(this.baseName);
            this.websocket = this.config.get('websocket') === 'no' ? false : this.config.get('websocket');
            this.databaseType = this.config.get('databaseType');
            this.searchEngine = this.config.get('searchEngine') === 'no' ? false : this.config.get('searchEngine');
            this.messageBroker = this.config.get('messageBroker') === 'no' ? false : this.config.get('messageBroker');
            this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
            this.enableTranslation = this.config.get('enableTranslation');
            this.enableSocialSignIn = this.config.get('enableSocialSignIn');
            this.currentLanguages = this.config.get('languages');
            this.clientFramework = this.config.get('clientFramework');
        }
    },

    prompting() {
        if (this.languages) return;

        const done = this.async();
        const languageOptions = this.getAllSupportedLanguageOptions();
        const prompts = [
            {
                type: 'checkbox',
                name: 'languages',
                message: 'Please choose additional languages to install',
                choices: languageOptions
            }];
        if (this.enableTranslation || configOptions.enableTranslation) {
            this.prompt(prompts).then((props) => {
                this.languagesToApply = props.languages || [];
                done();
            });
        } else {
            this.log(chalk.red('Translation is disabled for the project. Languages cannot be added.'));
        }
    },

    default: {
        insight() {
            const insight = this.insight();
            insight.trackWithEvent('generator', 'languages');
        },

        getSharedConfigOptions() {
            if (configOptions.applicationType) {
                this.applicationType = configOptions.applicationType;
            }
            if (configOptions.baseName) {
                this.baseName = configOptions.baseName;
            }
            if (configOptions.websocket !== undefined) {
                this.websocket = configOptions.websocket;
            }
            if (configOptions.databaseType) {
                this.databaseType = configOptions.databaseType;
            }
            if (configOptions.searchEngine !== undefined) {
                this.searchEngine = configOptions.searchEngine;
            }
            if (configOptions.messageBroker !== undefined) {
                this.messageBroker = configOptions.messageBroker;
            }
            if (configOptions.enableTranslation) {
                this.enableTranslation = configOptions.enableTranslation;
            }
            if (configOptions.nativeLanguage) {
                this.nativeLanguage = configOptions.nativeLanguage;
            }
            if (configOptions.enableSocialSignIn !== undefined) {
                this.enableSocialSignIn = configOptions.enableSocialSignIn;
            }
            if (configOptions.skipClient) {
                this.skipClient = configOptions.skipClient;
            }
            if (configOptions.skipServer) {
                this.skipServer = configOptions.skipServer;
            }
            if (configOptions.clientFramework) {
                this.clientFramework = configOptions.clientFramework;
            }
        },

        saveConfig() {
            if (this.enableTranslation) {
                this.config.set('languages', _.union(this.currentLanguages, this.languagesToApply));
            }
        }
    },

    writing() {
        const insight = this.insight();
        this.languagesToApply.forEach((language) => {
            if (!this.skipClient) {
                this.installI18nClientFilesByLanguage(this, constants.CLIENT_MAIN_SRC_DIR, language);
            }
            if (!this.skipServer) {
                this.installI18nServerFilesByLanguage(this, constants.SERVER_MAIN_RES_DIR, language);
            }
            insight.track('languages/language', language);
        });
        if (!this.skipClient) {
            if (this.clientFramework === 'angular1') {
                this.updateLanguagesInLanguageConstant(this.config.get('languages'));
            } else {
                this.updateLanguagesInLanguageConstantNG2(this.config.get('languages'));
            }
        }
    }
});
