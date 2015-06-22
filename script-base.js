'use strict';
var path = require('path'),
    util = require('util'),
    yeoman = require('yeoman-generator'),
    jhipsterUtils = require('./util.js'),
    shelljs = require('shelljs'),
    Insight = require('insight'),
    html = require("html-wiring"),
    ejs = require('ejs');

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

Generator.prototype.addRouterToMenu = function (entityName,enableTranslation) {
    try {
        var appPath = this.env.options.appPath;
        var fullPath = path.join(appPath, 'scripts/components/navbar/navbar.html');
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- JHipster will add entities to the menu here -->',
            splicable: [
                    '<li ui-sref-active="active" ><a ui-sref="' + entityName + '"><span class="glyphicon glyphicon-asterisk"></span>\n' +
                    '                        &#xA0;<span ' + ( enableTranslation ? 'translate="global.menu.entities.' + entityName + '"':'' ) + '>' + entityName + '</span></a></li>'
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
    var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    var year = "" + now_utc.getFullYear();
    var month = "" + (now_utc.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    var day = "" + now_utc.getDate(); if (day.length == 1) { day = "0" + day; }
    var hour = "" + now_utc.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    var minute = "" + now_utc.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    var second = "" + now_utc.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "" + month + "" + day + "" + hour + "" + minute + "" + second;
};

Generator.prototype.installI18nFilesByLanguage = function (_this, webappDir, resourceDir, lang) {
    this.copyI18nFilesByName(_this, webappDir, 'activate.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'audits.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'configuration.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'error.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'login.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'logs.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'main.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'metrics.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'password.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'register.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'sessions.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'settings.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'reset.json', lang);

    // tracker.json for Websocket
    if (this.websocket == 'spring-websocket') {
        this.copyI18nFilesByName(_this, webappDir, 'tracker.json', lang);
    }

    // Templates
    _this.template(webappDir + '/i18n/' + lang + '/_global.json', webappDir + 'i18n/' + lang + '/global.json', this, {});
    _this.template(webappDir + '/i18n/' + lang + '/_health.json', webappDir + 'i18n/' + lang + '/health.json', this, {});

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
        console.log('\nUnable to find '.yellow + fullPath + '. Reference to '.yellow + language + 'not added as a new language. Check if you have enabled translation support.\n'.yellow);
    }
};

Generator.prototype.addNewEntityToMenu = function(language, key, value) {
    var appPath = this.env.options.appPath;
    var fullPath = path.join(appPath, 'i18n/' + language + '/global.json');
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '"additionalEntity": "JHipster will add additional entities here (do not translate!)"',
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

Generator.prototype.copyHtml = function (source, dest, data, _opt, template) {

    _opt = _opt !== undefined ? _opt : {};
    data = data !== undefined ? data : this;
    if (this.enableTranslation) {
        // uses template method instead of copy if template boolean is set as true
        template ? this.template(source, dest, data, _opt) : this.copy(source, dest);
    } else {
        var regex = '( translate\="([a-zA-Z0-9](\.)?)+")|( translate-values\="\{([a-zA-Z]|\d|\:|\{|\}|\[|\]|\-|\'|\s|\.)*?\}")';         
        //looks for something like translate="foo.bar.message" and translate-values="{foo: '{{ foo.bar }}'}" 
        var body = this.stripContent(source, regex, data, _opt);
        body = this.replacePlaceholders(body, data);
        this.write(dest, body);
    }
}


Generator.prototype.copyJs = function (source, dest, data, _opt, template) {
    _opt = _opt !== undefined ? _opt : {};
    data = data !== undefined ? data : this;
    if (this.enableTranslation) {
        // uses template method instead of copy if template boolean is set as true
        template ? this.template(source, dest, data, _opt) : this.copy(source, dest);
    } else {
        var regex = '[a-zA-Z]+\:(\s)?\[[ \'a-zA-Z0-9\$\,\(\)\{\}\n\.\<\%\=\>\;\s]*\}\]'; 
        //looks for something like mainTranslatePartialLoader: [*]
        var body = this.stripContent(source, regex, data, _opt);
        body = this.replaceTitle(body, data, template);
        this.write(dest, body);
    }
}


Generator.prototype.stripContent = function (source, regex, data, _opt) {
    var re = new RegExp(regex, 'g');
    var that=this;

    var body = html.readFileAsString(path.join(that.sourceRoot(), source));
    this.engine = require('ejs').render;
    body = this.engine(body, data, _opt);
    body = body.replace(re, '');

    return body;
}

Generator.prototype.replaceTitle = function (body, data, template) {
    var re = /pageTitle[\s]*:[\s]*[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"]/g;
    var match;

    while (match = re.exec(body)) {
        // match is now the next match, in array form and our key is at index 1, index 1 is replace target.
        var key = match[1], target = key;
        var jsonData = this.geti18nJson(key, data);
        var keyValue = jsonData !== undefined ? this.deepFind(jsonData, key) : undefined;

        body = body.replace(target, keyValue!== undefined ? keyValue : this.baseName);
    }

    return body;
}

Generator.prototype.replacePlaceholders = function (body, data) {
    var re = /placeholder=[\'|\"]([\{]{2}[\'|\"]([a-zA-Z0-9\.\-\_]+)[\'|\"][\s][\|][\s](translate)[\}]{2})[\'|\"]/g;
    var match;

    while (match = re.exec(body)) {
        // match is now the next match, in array form and our key is at index 2, index 1 is replace target.
        var key = match[2], target = match[1];
        var jsonData = this.geti18nJson(key, data);
        var keyValue = jsonData !== undefined ? this.deepFind(jsonData, key, true) : undefined; // dirty fix to get placeholder as it is not in proper json format, name has a dot in it. Assuming that all placeholders are in similar format

        body = body.replace(target, keyValue!== undefined ? keyValue : '');
    }

    return body;
}

Generator.prototype.geti18nJson = function (key, data, template) {
    var that = this,
    i18nDirectory = 'src/main/webapp/i18n/en/',
    filename = i18nDirectory + key.split('.')[0] + '.json',
    keyValue, render = template;

    if (!shelljs.test('-f', path.join(that.sourceRoot(), filename))) {
        filename = i18nDirectory + '_' +key.split('.')[0] + '.json';
        render = true;
    }
    try {
        var file = html.readFileAsString(path.join(that.sourceRoot(), filename));
        this.engine = require('ejs').render;
        file = render ? this.engine(file, data, {}) : file;
        return JSON.parse(file);
    } catch (err) {
        // 'Error reading translation file!'
        return undefined;
    }
}

Generator.prototype.deepFind = function (obj, path, placeholder) {
    var paths = path.split('.'), current=obj, i;
    if(placeholder){// dirty fix for placeholders, the json files needs to be corrected
        paths[paths.length-2] = paths[paths.length-2] + '.' + paths[paths.length-1];
        paths.pop();
    }
    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
}
