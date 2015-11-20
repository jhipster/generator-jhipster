'use strict';
var util = require('util'),
path = require('path'),
yeoman = require('yeoman-generator'),
exec = require('child_process').exec,
chalk = require('chalk'),
_ = require('underscore.string'),
scriptBase = require('../script-base');

var LanguagesGenerator = module.exports = function LanguagesGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('Languages configuration is starting'));
    this.baseName = this.config.get('baseName');
    this.websocket = this.config.get('websocket');
    this.databaseType = this.config.get('databaseType');
    this.searchEngine = this.config.get('searchEngine');
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.enableTranslation = this.config.get('enableTranslation');
    this.enableSocialSignIn = this.config.get('enableSocialSignIn');
};

util.inherits(LanguagesGenerator, yeoman.generators.Base);
util.inherits(LanguagesGenerator, scriptBase);

LanguagesGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [
    {
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
            this.languages = props.languages;
            cb();
        }.bind(this));
    }else{
        console.log(chalk.red('Translation is disabled for the project. Language cannot be added.'));
        return;
    }
};

LanguagesGenerator.prototype.files = function files() {
    var webappDir = 'src/main/webapp/';
    var resourceDir = 'src/main/resources/';
    var insight = this.insight();
    insight.track('generator', 'languages');

    for (var id in this.languages) {
        var language = this.languages[id];
        this.installI18nFilesByLanguage(this, webappDir, resourceDir, language);
        this.installNewLanguage(language);
        this.addMessageformatLocaleToIndex(language.split("-")[0] + '.js');
        insight.track('languages/language', language);
    }
};
