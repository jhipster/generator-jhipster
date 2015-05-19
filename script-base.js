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
    this.copyI18nFilesByName(_this, webappDir, 'language.json', lang);
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

Generator.prototype.copyHtmlTpl = function (source, dest, _this, _opt) {
    _opt = _opt !== undefined ? _opt : {};
    if (_this.enableTranslation) {
        _this.copy(source, dest);
    } else {
        _this.stripTranslationInHtml(this, source, dest, _opt);
    }
}

Generator.prototype.copyThymeleafTpl = function (source, dest, _this, _opt) {
    _opt = _opt !== undefined ? _opt : {};
    if (_this.enableTranslation) {
        _this.copy(source, dest);
    } else {
        _this.stripTranslationInThymeleaf(this, source, dest, _opt);
    }
}

Generator.prototype.htmlTpl = function (source, dest, _this, _opt) {
    _opt = _opt !== undefined ? _opt : {};
    if (_this.enableTranslation) {
        _this.template(source, dest, _this, _opt);
    } else {
        _this.stripTranslationInHtml(this, source, dest, _opt);
    }
}

Generator.prototype.copyJsTpl = function (source, dest, _this, _opt) {
    _opt = _opt !== undefined ? _opt : {};
    if (_this.enableTranslation) {
        _this.copy(source, dest);
    } else {
        _this.stripTranslationInJs(this, source, dest, _opt);
    }
}

Generator.prototype.stripTranslationInHtml = function (_this, source, dest, _opt) {
    var directiveRegex = '( translate\="([a-zA-Z0-9](\.)?)+")|( translate-values\="\{([a-zA-Z]|\d|\:|\{|\}|\[|\]|\-|\'|\s|\.)*?\}")';         
    //looks for something like translate="foo.bar.message" and translate-values="{foo: '{{ foo.bar }}'}" 

    var body = _this.readFileAsString(path.join(_this.sourceRoot(), source));
    body = _this.stripContent(_this, body, directiveRegex, _opt)
    _this.write(dest, body);
}

Generator.prototype.stripTranslationInThymeleaf = function (_this, source, dest, _opt) {
    var directiveRegex = '( th\:text\="#\{([a-zA-Z0-9\$\{\}\.\(\)\#\[\]](\.)?)+\}")';         
    //looks for something like th:text="#{email.activation.greeting(${user.login})}"

    var body = _this.readFileAsString(path.join(_this.sourceRoot(), source));
    body = _this.stripContent(_this, body, directiveRegex, _opt)
    _this.write(dest, body);
}

Generator.prototype.stripTranslationInJs = function (_this, source, dest, _opt) {
    var directiveRegex = '[a-zA-Z]+\:(\s)?\[[ \'a-zA-Z0-9\$\,\(\)\{\}\n\.\<\%\=\>\;\s]*\}\]'; 
    //looks for something like mainTranslatePartialLoader: [*]

    var body = _this.readFileAsString(path.join(_this.sourceRoot(), source));
    body = _this.stripContent(_this, body, directiveRegex, _opt)
    _this.write(dest, body);
}

Generator.prototype.stripContent = function (_this, body, regex, _opt) {
    var re = new RegExp(regex, 'g');
    body = _this.engine(body, _this, _opt);
    body = body.replace(re, '');
    
    return body;
}