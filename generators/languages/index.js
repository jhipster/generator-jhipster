'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('lodash'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

var LanguagesGenerator = generators.Base.extend({});

util.inherits(LanguagesGenerator, scriptBase);

var configOptions = {};

module.exports = LanguagesGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        configOptions = this.options.configOptions || {};

        // This makes it possible to pass `languages` by argument
        this.argument('languagesArgument', {
            type: Array,
            required: false,
            description: 'Languages'
        });

        // This adds support for a `--skip-wiredep` flag
        this.option('skip-wiredep', {
            desc: 'Skip the wiredep step',
            type: Boolean,
            defaults: false
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

        this.skipWiredep = this.options['skip-wiredep'];
        this.skipClient = this.options['skip-client'];
        this.skipServer = this.options['skip-server'];


        // Validate languages passed as argument
        this.languagesArgument && this.languagesArgument.forEach(function (language) {
            if (!this.isSupportedLanguage(language)) {
                this.env.error(chalk.red('ERROR Unsupported language "' + language + '" passed as argument to language generator.' +
                    '\nSupported languages: ' + _.map(this.getAllSupportedLanguageOptions(), function(o){
                        return '\n  ' + _.padRight(o.value, 5) + ' (' + o.name + ')'
                    }).join(''))
                );
            }
        }, this);
    },
    initializing : {
        getConfig : function () {
            if (this.languagesArgument) {
                if (this.skipClient) {
                    this.log(chalk.bold('Installing languages: ' + this.languagesArgument.join(' ') + ' for server'));
                } else if (this.skipServer) {
                    this.log(chalk.bold('Installing languages: ' + this.languagesArgument.join(' ') + ' for client'));
                } else {
                    this.log(chalk.bold('Installing languages: ' + this.languagesArgument.join(' ')));
                }
            } else {
                this.log(chalk.bold('Languages configuration is starting'));
            }
            this.applicationType = this.config.get('applicationType');
            this.baseName = this.config.get('baseName');
            this.websocket = this.config.get('websocket');
            this.databaseType = this.config.get('databaseType');
            this.searchEngine = this.config.get('searchEngine');
            this.env.options.appPath = this.config.get('appPath') || CLIENT_MAIN_SRC_DIR;
            this.enableTranslation = this.config.get('enableTranslation');
            this.enableSocialSignIn = this.config.get('enableSocialSignIn');
        }
    },

    prompting : function () {
        var cb = this.async();

        var languagesArgument = this.languagesArgument;
        var languageOptions = this.getAllSupportedLanguageOptions();
        var prompts = [
        {
            when: function(){
                return languagesArgument === undefined;
            },
            type: 'checkbox',
            name: 'languages',
            message: 'Please choose additional languages to install',
            choices: languageOptions
        }];
        if (this.enableTranslation || configOptions.enableTranslation) {
            this.prompt(prompts, function (props) {
                this.languages = this.languagesArgument || props.languages;
                cb();
            }.bind(this));
        } else {
            this.log(chalk.red('Translation is disabled for the project. Languages cannot be added.'));
            return;
        }
    },

    default: {

        getSharedConfigOptions: function () {
            if(configOptions.applicationType) {
                this.applicationType = configOptions.applicationType;
            }
            if(configOptions.baseName) {
                this.baseName = configOptions.baseName;
            }
            if(configOptions.websocket) {
                this.websocket = configOptions.websocket;
            }
            if(configOptions.databaseType) {
                this.databaseType = configOptions.databaseType;
            }
            if(configOptions.searchEngine) {
                this.searchEngine = configOptions.searchEngine;
            }
            if(configOptions.enableTranslation) {
                this.enableTranslation = configOptions.enableTranslation;
            }
            if(configOptions.nativeLanguage) {
                this.nativeLanguage = configOptions.nativeLanguage;
            }
            if(configOptions.enableSocialSignIn != null) {
                this.enableSocialSignIn = configOptions.enableSocialSignIn;
            }
            if(configOptions.skipClient) {
                this.skipClient = configOptions.skipClient;
            }
            if(configOptions.skipServer) {
                this.skipServer = configOptions.skipServer;
            }
        },

        saveConfig: function () {
            if (this.enableTranslation) {
                var currentLanguages = this.config.get('languages');
                this.config.set('languages', _.union(currentLanguages, this.languages));
            }
        }
    },

    writing : function () {
        var insight = this.insight();
        insight.track('generator', 'languages');

        this.languages.forEach(function (language) {
            if (!this.skipClient) {
                this.installI18nClientFilesByLanguage(this, CLIENT_MAIN_SRC_DIR, language);
                this.addMessageformatLocaleToBowerOverride(language.split("-")[0]);
            }
            if (!this.skipServer) {
                this.installI18nServerFilesByLanguage(this, SERVER_MAIN_RES_DIR, language);
            }
            insight.track('languages/language', language);
        }, this);
        if (!this.skipClient) {
            this.updateLanguagesInLanguageConstant(this.config.get('languages'));
        }
    },

    install: function () {
        var wiredepAddedBowerOverrides = function () {
            this.spawnCommand('gulp', ['wiredep']);
        };
        if (!this.skipWiredep && !this.skipClient) {
            wiredepAddedBowerOverrides.call(this);
        }
    }
});
