'use strict';
var util = require('util'),
path = require('path'),
yeoman = require('yeoman-generator'),
exec = require('child_process').exec,
chalk = require('chalk'),
_s = require('underscore.string'),
scriptBase = require('../script-base');

var LanguagesGenerator = module.exports = function LanguagesGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('Languages configuration is starting'));
    this.baseName = this.config.get('baseName');
    this.websocket = this.config.get('websocket');
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
};

util.inherits(LanguagesGenerator, yeoman.generators.Base);
util.inherits(LanguagesGenerator, scriptBase);

LanguagesGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [
    {
        type: "checkbox",
        name: 'languages',
        message: 'Please choose additional languages to install',
        choices: [
            {name: 'Catalan', value: 'ca'},
            {name: 'Chinese (Traditional)', value: 'zh-tw'},
            {name: 'Danish', value: 'da'},
            {name: 'German', value: 'de'},
            {name: 'Korean', value: 'kr'},
            {name: 'Polish', value: 'pl'},
            {name: 'Portuguese (Brazilian)', value: 'pt-br'},
            {name: 'Russian', value: 'ru'},
            {name:  'Spanish', value: 'es'},
            {name:  'Swedish', value: 'sv'},
            {name: 'Turkish', value: 'tr'}
        ],
        default: 0
    }];

    this.prompt(prompts, function (props) {
        this.languages = props.languages;
        cb();
    }.bind(this));
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
        insight.track('languages/language', language);
    }
};
