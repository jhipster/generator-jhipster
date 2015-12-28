'use strict';
var path = require('path'),
    util = require('util'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
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

/**
 * A a new script to the application, in the index.html file.
 *
 * This is used to add AngularJS controllers or components to the application.
 */
Generator.prototype.addJavaScriptToIndex = function (script) {
    try {
        var fullPath = 'src/main/webapp/index.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- endbuild -->',
            splicable: [
                    '<script src="scripts/' + script + '"></script>'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + script + '.js ' + chalk.yellow('not added.\n'));
    }
};

/**
 * A a new message format to the application, in the index.html file.
 *
 * This is used for internationalization.
 */
Generator.prototype.addMessageformatLocaleToIndex = function (script) {
    try {
        var fullPath = 'src/main/webapp/index.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: '<!-- endbuild -->',
            splicable: [
                    '<script src="bower_components/messageformat/locale/' + script + '"></script>'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + script + '.js ' + chalk.yellow('not added.\n'));
    }
};

/**
 * Add a new menu element, at the root of the menu.
 *
 * @param {string} routerName - The name of the AngularJS router that is added to the menu.
 * @param {string} glyphiconName - The name of the Glyphicon (from Bootstrap) that will be displayed.
 * @param {boolean} enableTranslation - If translations are enabled or not
 */
Generator.prototype.addElementToMenu = function (routerName, glyphiconName, enableTranslation) {
    try {
        var fullPath = 'src/main/webapp/scripts/components/navbar/navbar.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-element-to-menu',
            splicable: [
                    '<li ui-sref-active="active" ><a ui-sref="' + routerName + '" data-toggle="collapse" data-target=".navbar-collapse.in"><span class="glyphicon glyphicon-' + glyphiconName + '"></span>\n' +
                    '                        &#xA0;<span ' + ( enableTranslation ? 'translate="global.menu.' + routerName + '"':'' ) + '>' + routerName + '</span></a></li>'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + routerName + '.js ' + chalk.yellow('not added.\n'));
    }
};

/**
 * Add a new entity in the "entities" menu.
 *
 * @param {string} routerName - The name of the AngularJS router (which by default is the name of the entity).
 * @param {boolean} enableTranslation - If translations are enabled or not
 */
Generator.prototype.addEntityToMenu = function (routerName, enableTranslation) {
    try {
        var fullPath = 'src/main/webapp/scripts/components/navbar/navbar.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-entity-to-menu',
            splicable: [
                    '<li ui-sref-active="active" ><a ui-sref="' + routerName + '" data-toggle="collapse" data-target=".navbar-collapse.in"><span class="glyphicon glyphicon-asterisk"></span>\n' +
                    '                        &#xA0;<span ' + ( enableTranslation ? 'translate="global.menu.entities.' + routerName + '"':'' ) + '>' + routerName + '</span></a></li>'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + routerName + '.js ' + chalk.yellow('not added.\n'));
    }
};

/**
 * A a new element in the "global.json" translations.
 *
 * @param {string} key - Key for the menu entry
 * @param {string} value - Default translated value
 * @param {string} language - The language to which this translation should be added
 */
Generator.prototype.addElementTranslationKey = function(key, value, language) {
    var fullPath = 'src/main/webapp/i18n/' + language + '/global.json';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-menu-add-element',
            splicable: [
                    '"' + key + '": "' + value + '",'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + language + chalk.yellow(' not added as a new entity in the menu.\n'));
    }
};


/**
 * Add a new parameter in the ".bowerrc".
 *
 * @param {string} key - name of the parameter
 * @param {string, obj, bool, etc.} value - value of the parameter
 */
Generator.prototype.addBowerrcParameter = function(key, value) {
    var fullPath ='.bowerrc';
    try {
        console.log(chalk.yellow('   update ') + fullPath);
        jhipsterUtils.rewriteJSONFile(fullPath, function(jsonObj) {
            jsonObj[key] = value;
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'bowerrc parameter (key: ' + key + ', value:' + value + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new dependency in the "bower.json".
 *
 * @param {string} name - dependency name
 * @param {string} version - dependency version
 */
Generator.prototype.addBowerDependency = function(name, version) {
    var fullPath ='bower.json';
    try {
        jhipsterUtils.rewriteJSONFile(fullPath, function(jsonObj) {
            jsonObj.dependencies[name] = version;
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'bower dependency (name: ' + name + ', version:' + version + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new override configuration in the "bower.json".
 *
 * @param {string} bowerPackageName - Bower package name use in dependencies
 * @param {array} main - You can specify which files should be selected
 * @param {boolean} isIgnored - Default: false, Set to true if you want to ignore this package.
 * @param {object} dependencies - You can override the dependencies of a package. Set to null to ignore the dependencies.
 *
 */
Generator.prototype.addBowerOverride = function(bowerPackageName, main, isIgnored, dependencies) {
    var fullPath = 'bower.json';
    try {
        jhipsterUtils.rewriteJSONFile(fullPath, function(jsonObj) {
            var override = {};
            if (main != null && main.length > 0) {
                override['main'] = main;
            }
            if (isIgnored) {
                override['ignore'] = true;
            }
            if (dependencies) {
                override['dependencies'] = dependencies;
            }
            if (jsonObj.overrides === undefined) {
              jsonObj.overrides = {};
            }
            jsonObj.overrides[bowerPackageName] = override;
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'bower override configuration (bowerPackageName: ' + bowerPackageName + ', main:' + JSON.stringify(main) + ', ignore:' + isIgnored + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new module to the angular application in "app.js".
 *
 * @param {string} moduleName - module name
 *
 */
Generator.prototype.addAngularJsModule = function(moduleName) {
    var fullPath = 'src/main/webapp/scripts/app/app.js';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-angularjs-add-module',
            splicable: [
                "'" + moduleName + "',"
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + moduleName + chalk.yellow(' not added to JHipster app.\n'));
    }
};

/**
 * Add a new configuration to the angular application in "app.js".
 *
 * @param {array} moduleConfigNames - modules name to import in your config
 * @param {string} config - javascript to put inside config
 * @param {string} comment - comment to add before the .config() to describe the config
 *
 * example:
 *
 * moduleConfigNames = ['moduleName1', 'moduleName2']
 * config = 'moduleName1.doSomething();\nmoduleName2.doOtherthing();'
 * comment = 'I am a config test'
 *
 * // I am a config test
 * .config(function(moduleName1, moduleName2) {
 *      moduleName1.doSomething();
 *      moduleName2.doOtherthing();
 * });
 *
 */
Generator.prototype.addAngularJsConfig = function(moduleConfigNames, config, comment) {
    var fullPath = 'src/main/webapp/scripts/app/app.js';
    var configBlock = '';
    if (comment) {
        configBlock += '// ' + comment + '\n    ';
    }
    configBlock += '.config(function (' + moduleConfigNames.join(', ') + ') {\n';
    configBlock += '        ' + config.replace(/\n/g, '\n        ') + '\n';
    configBlock += '    })';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-angularjs-add-config',
            splicable: [
                configBlock
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Configuration not added to JHipster app.\n'));
    }
};

/**
 * A a new entity in the "global.json" translations.
 *
 * @param {string} key - Key for the entity name
 * @param {string} value - Default translated value
 * @param {string} language - The language to which this translation should be added
 */
Generator.prototype.addEntityTranslationKey = function(key, value, language) {
    var fullPath = 'src/main/webapp/i18n/' + language + '/global.json';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-menu-add-entry',
            splicable: [
                    '"' + key + '": "' + value + '",'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + language + chalk.yellow(' not added as a new entity in the menu.\n'));
    }
};

/**
 * A a new changelog to the Liquibase master.xml file.
 *
 * @param {changelogName} routerName - The name of the changelog (name of the file without .xml at the end).
 */
Generator.prototype.addChangelogToLiquibase = function (changelogName) {
    try {
        var fullPath = 'src/main/resources/config/liquibase/master.xml';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-liquibase-add-changelog',
            splicable: [
                    '<include file="classpath:config/liquibase/changelog/' + changelogName + '.xml" relativeToChangelogFile="false"/>'
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + changelogName + '.js ' + chalk.yellow('not added.\n'));
    }
};

/**
 * Add a new social connection factory in the SocialConfiguration.java file.
 *
 * @param {string} socialName - name of the social module. ex: 'facebook'
 * @param {string} socialParameter - parameter to send to social connection ex: 'public_profile,email'
 * @param {string} buttonColor - color of the social button. ex: '#3b5998'
 * @param {string} buttonHoverColor - color of the social button when is hover. ex: '#2d4373'
 */
Generator.prototype.addSocialButton = function (socialName, socialParameter, buttonColor, buttonHoverColor) {
    var socialServicefullPath = 'src/main/webapp/scripts/app/account/social/social.service.js';
    var loginfullPath = 'src/main/webapp/scripts/app/account/login/login.html';
    var registerfullPath = 'src/main/webapp/scripts/app/account/register/register.html';
    try {
        console.log(chalk.yellow('\nupdate ') + socialServicefullPath);
        var serviceCode =  "case '" + socialName + "': return '"+ socialParameter +"';";
        jhipsterUtils.rewriteFile({
            file: socialServicefullPath,
            needle: 'jhipster-needle-add-social-button',
            splicable: [
                serviceCode
            ]
        });

        var buttonCode = '<jh-social ng-provider="'+ socialName +'"></jh-social>';
        console.log(chalk.yellow('update ') + loginfullPath);
        jhipsterUtils.rewriteFile({
            file: loginfullPath,
            needle: 'jhipster-needle-add-social-button',
            splicable: [
                buttonCode
            ]
        });
        console.log(chalk.yellow('update ') + registerfullPath);
        jhipsterUtils.rewriteFile({
            file: registerfullPath,
            needle: 'jhipster-needle-add-social-button',
            splicable: [
                buttonCode
            ]
        });

        var buttonStyle = '.jh-btn-' + socialName + ' {\n' +
            '     background-color: ' + buttonColor + ';\n' +
            '     border-color: rgba(0, 0, 0, 0.2);\n' +
            '     color: #fff;\n' +
            '}\n\n' +
            '.jh-btn-' + socialName + ':hover, .jh-btn-' + socialName + ':focus, .jh-btn-' + socialName + ':active, .jh-btn-' + socialName + '.active, .open > .dropdown-toggle.jh-btn-' + socialName + ' {\n' +
            '    background-color: ' + buttonHoverColor + ';\n' +
            '    border-color: rgba(0, 0, 0, 0.2);\n' +
            '    color: #fff;\n' +
            '}';
        this.addMainCSSStyle(buttonStyle,'Add sign in style for ' +  socialName);

    } catch (e) {
        console.log(chalk.yellow('\nUnable to add social button modification.\n' + e));
    }
};

/**
 * Add a new social connection factory in the SocialConfiguration.java file.
 *
 * @param {string} javaDir - default java directory of the project (JHipster var)
 * @param {string} importPackagePath - package path of the ConnectionFactory class
 * @param {string} socialName - name of the social module
 * @param {string} connectionFactoryClassName - name of the ConnectionFactory class
 * @param {string} configurationName - name of the section in the config yaml file
 */
Generator.prototype.addSocialConnectionFactory = function (javaDir, importPackagePath, socialName, connectionFactoryClassName, configurationName) {
    var fullPath = javaDir + 'config/social/SocialConfiguration.java';
    try {
        console.log(chalk.yellow('\nupdate ') + fullPath);
        var javaImport = 'import ' + importPackagePath +';\n';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-social-connection-factory-import-package',
            splicable: [
                javaImport
            ]
        });

        var clientId = socialName + 'ClientId';
        var clientSecret = socialName + 'ClientSecret';
        var javaCode = '// ' + socialName + ' configuration\n' +
            '        String ' + clientId + ' = environment.getProperty("spring.social.' + configurationName + '.clientId");\n' +
            '        String ' + clientSecret + ' = environment.getProperty("spring.social.' + configurationName + '.clientSecret");\n' +
            '        if (' + clientId + ' != null && ' + clientSecret + ' != null) {\n' +
            '            log.debug("Configuring ' + connectionFactoryClassName + '");\n' +
            '            connectionFactoryConfigurer.addConnectionFactory(\n' +
            '                new ' + connectionFactoryClassName + '(\n' +
            '                    ' + clientId + ',\n' +
            '                    ' + clientSecret + '\n' +
            '                )\n' +
            '            );\n' +
            '        } else {\n' +
            '            log.error("Cannot configure ' + connectionFactoryClassName + ' id or secret null");\n' +
            '        }\n';

        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-social-connection-factory',
            splicable: [
                javaCode
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Social connection ') + e + ' ' + chalk.yellow('not added.\n'));
    }
};

/**
 * Add new css style to the angular application in "main.css".
 *
 * @param {string} style - css to add in the file
 * @param {string} comment - comment to add before css code
 *
 * example:
 *
 * style = '.jhipster {\n     color: #baa186;\n}'
 * comment = 'New JHipster color'
 *
 * * ==========================================================================
 * New JHipster color
 * ========================================================================== *
 * .jhipster {
 *     color: #baa186;
 * }
 *
 */
Generator.prototype.addMainCSSStyle = function(style, comment) {
    // Not Working this.useSass -> Undifined
    if (this.useSass) {
        this.addMainSCSSStyle(style, comment);
    }

    var fullPath = 'src/main/webapp/assets/styles/main.css';
    var styleBlock = '';
    if (comment) {
        styleBlock += '/* ==========================================================================\n';
        styleBlock += comment + '\n';
        styleBlock += '========================================================================== */\n';
    }
    styleBlock += style + '\n';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-css-add-main',
            splicable: [
                styleBlock
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Style not added to JHipster app.\n'));
    }
};

/**
 * Add new scss style to the angular application in "main.scss".
 *
 * @param {string} style - scss to add in the file
 * @param {string} comment - comment to add before css code
 *
 * example:
 *
 * style = '.success {\n     @extend .message;\n    border-color: green;\n}'
 * comment = 'Message'
 *
 * * ==========================================================================
 * Message
 * ========================================================================== *
 * .success {
 *     @extend .message;
 *     border-color: green;
 * }
 *
 */
Generator.prototype.addMainSCSSStyle = function(style, comment) {
    var fullPath = 'src/main/scss/main.scss';
    var styleBlock = '';
    if (comment) {
        styleBlock += '/* ==========================================================================\n';
        styleBlock += comment + '\n';
        styleBlock += '========================================================================== */\n';
    }
    styleBlock += style + '\n';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-scss-add-main',
            splicable: [
                styleBlock
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Style not added to JHipster app.\n'));
    }
};

/**
 * Add a new Maven dependency.
 *
 * @param {groupId} dependency groupId
 * @param {artifactId} dependency artifactId
 * @param {version} explicit dependency version number
 * @param {other} explicit other thing: scope, exclusions...
 */
Generator.prototype.addMavenDependency = function (groupId, artifactId, version, other) {
    try {
        var fullPath = 'pom.xml';
        var dependency = '<dependency>\n' +
            '            <groupId>' + groupId + '</groupId>\n' +
            '            <artifactId>' + artifactId + '</artifactId>\n';
        if (version) {
            dependency += '            <version>' + version + '</version>\n';
        }
        if (other) {
            dependency += other + '\n';
        }
        dependency += '        </dependency>';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-maven-add-dependency',
            splicable: [
                dependency
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'maven dependency (groupId: ' + groupId + ', artifactId:' + artifactId + ', version:' + version + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new Maven plugin.
 *
 * @param {groupId} plugin groupId
 * @param {artifactId} plugin artifactId
 * @param {version} explicit plugin version number
 * @param {other} explicit other thing: executions, configuration...
 */
Generator.prototype.addMavenPlugin = function (groupId, artifactId, version, other) {
    try {
        var fullPath = 'pom.xml';
        var plugin =  '<plugin>\n' +
            '                <groupId>' + groupId + '</groupId>\n' +
            '                <artifactId>' + artifactId + '</artifactId>\n';
        if (version) {
            plugin += '                <version>' + version + '</version>\n';
        }
        if (other) {
            plugin += other + '\n';
        }
        plugin += '            </plugin>';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-maven-add-plugin',
            splicable: [
                plugin
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'maven plugin (groupId: ' + groupId + ', artifactId:' + artifactId + ', version:' + version + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * A new Gradle plugin.
 *
 * @param {group} plugin GroupId
 * @param {name} plugin name
 * @param {version} explicit plugin version number
 */
Generator.prototype.addGradlePlugin = function (group, name, version) {
    try {
        var fullPath = 'build.gradle';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-gradle-buildscript-dependency',
            splicable: [
                'classpath group: \'' + group + '\', name: \'' + name + '\', version: \'' + version + '\''
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'classpath: ' + group + ':' + name + ':' + version + chalk.yellow(' not added.\n'));
    }
};

/**
 * A new dependency to build.gradle file.
 *
 * @param {scope} scope of the new dependency, e.g. compile
 * @param {group} maven GroupId
 * @param {name} maven ArtifactId
 * @param {version} explicit version number
 */
Generator.prototype.addGradleDependency = function (scope, group, name, version) {
    try {
        var fullPath = 'build.gradle';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-gradle-dependency',
            splicable: [
                scope + ' group: \'' + group + '\', name: \'' + name + '\', version: \'' + version + '\''
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + group + ':' + name + ':' + version + chalk.yellow(' not added.\n'));
    }
};

/**
 * Apply from an external Gradle build script.
 *
 * @param {name} name of the file to apply from, must be 'fileName.gradle'
 */
Generator.prototype.applyFromGradleScript = function (name) {
    try {
        var fullPath = 'build.gradle';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-gradle-apply-from',
            splicable: [
                    'apply from: \'' + name + '.gradle\''
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + name + chalk.yellow(' not added.\n'));
    }
};

/**
 * Generate a date to be used by Liquibase changelogs.
 */
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
    this.copyI18nFilesByName(_this, webappDir, 'user.management.json', lang);

    // tracker.json for Websocket
    if (this.websocket == 'spring-websocket') {
        this.copyI18nFilesByName(_this, webappDir, 'tracker.json', lang);
    }

    if (this.enableSocialSignIn) {
        this.copyI18nFilesByName(_this, webappDir, 'social.json', lang);
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
    var fullPath = 'src/main/webapp/scripts/components/language/language.service.js';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-006',
            splicable: [
                    ',\'' + language + '\''
            ]
        });
    } catch (e) {
        console.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + language + chalk.yellow(' not added as a new language. Check if you have enabled translation support.\n'));
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
    //temp hack to fix error thrown by ejs during entity creation, this needs a permanent fix when we add more .ejs files
    _opt.filename = path.join(that.sourceRoot(), "src/main/webapp/app/ng_validators.ejs");
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
