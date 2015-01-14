'use strict';
var path = require('path'),
    util = require('util'),
    yeoman = require('yeoman-generator'),
    jhipsterUtils = require('./util.js'),
    Insight = require('insight');

module.exports = Generator;

function Generator() {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
}

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.addAppScriptToIndex = function (script) {
    try {
        var appPath = this.env.options.appPath;
        var fullPath = path.join(appPath, 'index.html');
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- endbuild -->',
            splicable: [
                    '<script src="scripts/app/entities/' + script + '"></script>'
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + script + '.js ' + 'not added.\n'.yellow);
    }
};

Generator.prototype.addComponentsScriptToIndex = function (script) {
    try {
        var appPath = this.env.options.appPath;
        var fullPath = path.join(appPath, 'index.html');
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- endbuild -->',
            splicable: [
                    '<script src="scripts/components/entities/' + script + '"></script>'
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + script + '.js ' + 'not added.\n'.yellow);
    }
};

Generator.prototype.addRouterToMenu = function (entityName) {
    try {
        var appPath = this.env.options.appPath;
        var fullPath = path.join(appPath, 'scripts/components/navbar/navbar.html');
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- JHipster will add entities to the menu here -->',
            splicable: [
                    '<li ui-sref-active="active" ><a ui-sref="' + entityName + '"><span class="glyphicon glyphicon-asterisk"></span>\n' +
                    '                        &#xA0;<span translate="global.menu.entities.' + entityName + '">'+ entityName+'</span></a></li>'
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + entityName + '.js ' + 'not added.\n'.yellow);
    }
};

Generator.prototype.addChangelogToLiquibase = function (changelogName) {
    try {
        var appPath = this.env.options.appPath;
        var fullPath = path.join(appPath, '../resources/config/liquibase/master.xml');
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- JHipster will add liquibase changelogs here -->',
            splicable: [
                    '<include file="classpath:config/liquibase/changelog/' + changelogName + '.xml" relativeToChangelogFile="false"/>'
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + changelogName + '.js ' + 'not added.\n'.yellow);
    }
};

// This generates a date to be used by Liquibase changelogs
Generator.prototype.dateFormatForLiquibase = function () {
    var now = new Date();
    var year = "" + now.getFullYear();
    var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "" + month + "" + day + "" + hour + "" + minute + "" + second;
};

Generator.prototype.installI18nFilesByLanguage = function (_this, webappDir, resourceDir, lang) {
    this.copyI18nFilesByName(_this, webappDir, 'activate.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'audits.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'configuration.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'error.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'health.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'language.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'login.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'logs.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'main.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'metrics.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'password.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'register.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'sessions.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'settings.json', lang);

    // remove the tracker.json files
    if (this.websocket == 'spring-websocket') {
        this.copyI18nFilesByName(_this, webappDir, 'tracker.json', lang);
    }

    // Template the global file
    _this.template(webappDir + '/i18n/' + lang + '/_global.json', webappDir + 'i18n/' + lang + '/global.json', this, {});

    // Template the message server side properties
    var lang_prop = lang.replace(/-/g, "_");
    _this.template(resourceDir + '/i18n/_messages_' + lang_prop + '.properties', resourceDir + 'i18n/messages_' + lang_prop + '.properties', this, {});

};

Generator.prototype.copyI18nFilesByName = function(_this, webappDir, fileToCopy, lang) {
    _this.copy(webappDir + '/i18n/' + lang + '/' + fileToCopy, webappDir + '/i18n/' + lang + '/' + fileToCopy);
};

Generator.prototype.installNewLanguage = function(language) {
    var appPath = this.env.options.appPath;
    var fullPath = path.join(appPath, 'scripts/components/language/language.service.js');
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '//JHipster will add new languages here',
            splicable: [
                    ',\'' + language + '\''
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + language + 'not added as a new language.\n'.yellow);
    }
};

Generator.prototype.addNewEntityToMenu = function(language, key, value) {
    var appPath = this.env.options.appPath;
    var fullPath = path.join(appPath, 'i18n/' + language + '/global.json');
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '"additionalEntity": "JHipster will add addtional entities"',
            splicable: [
                    '"' + key + '": "' + value + '",'
            ]
        });
    } catch (e) {
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + language + 'not added as a new entity in the menu.\n'.yellow);
    }
};

Generator.prototype.insight = function () {
    var pkg = require('./package.json');
    var insight = new Insight({
        trackingCode: 'UA-46075199-2',
        packageName: pkg.name,
        packageVersion: pkg.version
    });
    return insight;
}
