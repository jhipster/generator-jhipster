'use strict';
var util = require('util'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

var LanguagesGenerator = generators.Base.extend({});

util.inherits(LanguagesGenerator, scriptBase);

module.exports = LanguagesGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);
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

        this.skipWiredep = this.options['skip-wiredep'];


        // Validate languages passed as argument
        for (var id in this.languagesArgument) {
            var language = this.languagesArgument[id];
            if (!this.isSupportedLanguage(language)) {
                this.env.error(chalk.red('ERROR Unsupported language "' + language + '" passed as argument to language generator.' +
                    '\nSupported languages: ' + this.getAllSupportedLanguages().join(', ')));
            }
        }
    },
    initializing : {
        getConfig : function () {
            this.log(chalk.bold('Languages configuration is starting'));
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
        var prompts = [
        {
            when: function(){
                return languagesArgument === undefined;
            },
            type: 'checkbox',
            name: 'languages',
            message: 'Please choose additional languages to install',
            choices: [
                {name: 'Catalan', value: 'ca'},
                {name: 'Chinese (Simplified)', value: 'zh-cn'},
                {name: 'Chinese (Traditional)', value: 'zh-tw'},
                {name: 'Danish', value: 'da'},
                {name: 'Dutch', value: 'nl'},
                {name: 'Galician', value: 'gl'},
                {name: 'German', value: 'de'},
                {name: 'Hungarian', value: 'hu'},
                {name: 'Italian', value: 'it'},
                {name: 'Japanese', value: 'ja'},
                {name: 'Korean', value: 'ko'},
                {name: 'Polish', value: 'pl'},
                {name: 'Portuguese (Brazilian)', value: 'pt-br'},
                {name: 'Portuguese', value: 'pt-pt'},
                {name: 'Romanian', value: 'ro'},
                {name: 'Russian', value: 'ru'},
                {name: 'Spanish', value: 'es'},
                {name: 'Swedish', value: 'sv'},
                {name: 'Turkish', value: 'tr'},
                {name: 'Tamil', value: 'ta'}
            ],
            default: 0
        }];
        if (this.enableTranslation) {
            this.prompt(prompts, function (props) {
                this.languages = this.languagesArgument || props.languages;
                cb();
            }.bind(this));
        } else {
            this.log(chalk.red('Translation is disabled for the project. Language cannot be added.'));
            return;
        }
    },

    writing : function () {
        var insight = this.insight();
        insight.track('generator', 'languages');

        for (var id in this.languages) {
            var language = this.languages[id];
            this.installI18nFilesByLanguage(this, CLIENT_MAIN_SRC_DIR, language);
            this.installI18nResFilesByLanguage(this, SERVER_MAIN_RES_DIR, language);
            this.installNewLanguage(language);
            this.addMessageformatLocaleToBowerOverride(language.split("-")[0]);
            insight.track('languages/language', language);
        }
    },

    install: function () {
        var wiredepAddedBowerOverrides = function () {
            this.spawnCommand('gulp', ['wiredep']);
        };
        if (!this.skipWiredep) {
            wiredepAddedBowerOverrides.call(this);
        }
    }
});
