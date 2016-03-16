'use strict';
var path = require('path'),
    util = require('util'),
    _ = require('lodash'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    jhipsterUtils = require('./util'),
    Insight = require('insight'),
    fs = require('fs'),
    shelljs = require('shelljs'),
    ejs = require('ejs'),
    packagejs = require('../package.json'),
    semver = require('semver');

const JHIPSTER_CONFIG_DIR = ".jhipster";
const MODULES_HOOK_FILE = JHIPSTER_CONFIG_DIR + '/modules/jhi-hooks.json';
const WORD_WRAP_WIDTH = 80;

const constants = require('./generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

module.exports = Generator;

function Generator() {
    yeoman.Base.apply(this, arguments);
    this.env.options.appPath = this.config.get('appPath') || CLIENT_MAIN_SRC_DIR;
}

util.inherits(Generator, yeoman.Base);

/**
 * A a new message format to the application, in the bower.json file.
 *
 * This is used for internationalization.
 * @param {string} language - name of the messageformat language
 */
Generator.prototype.addMessageformatLocaleToBowerOverride = function (language) {
    var fullPath = 'bower.json';
    try {
        jhipsterUtils.rewriteJSONFile(fullPath, function (jsonObj) {
            var messageformatLocale = 'locale/' + language + '.js';
            if (jsonObj.overrides === undefined) {
                jsonObj.overrides = {};
            }
            if (jsonObj.overrides.messageformat === undefined) {
                jsonObj.overrides.messageformat = {};
            }
            if (jsonObj.overrides.messageformat.main === undefined) {
                jsonObj.overrides.messageformat.main = ['messageformat.js'];
            }
            if (!_.includes(jsonObj.overrides.messageformat.main, messageformatLocale)) {
                jsonObj.overrides.messageformat.main.push(messageformatLocale);
            }
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Messageformat locale override not added for language: ' + language + ' to ') + 'bower override configuration ' + chalk.yellow(' not added.\n'));
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
        var fullPath = CLIENT_MAIN_SRC_DIR + 'app/layouts/navbar/navbar.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-element-to-menu',
            splicable: [
                '<li ui-sref-active="active" ><a ui-sref="' + routerName + '" data-toggle="collapse" data-target=".navbar-collapse.in"><span class="glyphicon glyphicon-' + glyphiconName + '"></span>\n' +
                '                        &#xA0;<span ' + ( enableTranslation ? 'translate="global.menu.' + routerName + '"' : '' ) + '>' + _.startCase(routerName) + '</span></a></li>'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + routerName + ' ' + chalk.yellow('not added to menu.\n'));
    }
};

/**
 * Add a new menu element to the admin menu.
 *
 * @param {string} routerName - The name of the AngularJS router that is added to the admin menu.
 * @param {string} glyphiconName - The name of the Glyphicon (from Bootstrap) that will be displayed.
 * @param {boolean} enableTranslation - If translations are enabled or not
 */
Generator.prototype.addElementToAdminMenu = function (routerName, glyphiconName, enableTranslation) {
    try {
        var fullPath = CLIENT_MAIN_SRC_DIR + 'app/layouts/navbar/navbar.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-element-to-admin-menu',
            splicable: [
                '<li ui-sref-active="active" ><a ui-sref="' + routerName + '" data-toggle="collapse" data-target=".navbar-collapse.in"><span class="glyphicon glyphicon-' + glyphiconName + '"></span>\n' +
                '                        &#xA0;<span ' + ( enableTranslation ? 'translate="global.menu.admin.' + routerName + '"' : '' ) + '>' + _.startCase(routerName) + '</span></a></li>'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + routerName + ' ' + chalk.yellow('not added to admin menu.\n'));
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
        var fullPath = CLIENT_MAIN_SRC_DIR + 'app/layouts/navbar/navbar.html';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-entity-to-menu',
            splicable: [
                '<li ui-sref-active="active" ><a ui-sref="' + routerName + '" data-toggle="collapse" data-target=".navbar-collapse.in"><span class="glyphicon glyphicon-asterisk"></span>\n' +
                '                        &#xA0;<span ' + ( enableTranslation ? 'translate="global.menu.entities.' + _.camelCase(routerName) + '"' : '' ) + '>' + _.startCase(routerName) + '</span></a></li>'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + routerName + ' ' + chalk.yellow('not added to menu.\n'));
    }
};

/**
 * A a new element in the "global.json" translations.
 *
 * @param {string} key - Key for the menu entry
 * @param {string} value - Default translated value
 * @param {string} language - The language to which this translation should be added
 */
Generator.prototype.addElementTranslationKey = function (key, value, language) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/global.json';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-menu-add-element',
            splicable: [
                '"' + key + '": "' + value + '",'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + language + chalk.yellow(' not added as a new entity in the menu.\n'));
    }
};

/**
 * A a new element in the admin section of "global.json" translations.
 *
 * @param {string} key - Key for the menu entry
 * @param {string} value - Default translated value
 * @param {string} language - The language to which this translation should be added
 */
Generator.prototype.addAdminElementTranslationKey = function (key, value, language) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/global.json';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-menu-add-admin-element',
            splicable: [
                '"' + key + '": "' + value + '",'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + language + chalk.yellow(' not added as a new entry in the admin menu.\n'));
    }
};

/**
 * A a new entity in the "global.json" translations.
 *
 * @param {string} key - Key for the entity name
 * @param {string} value - Default translated value
 * @param {string} language - The language to which this translation should be added
 */
Generator.prototype.addEntityTranslationKey = function (key, value, language) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/global.json';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-menu-add-entry',
            splicable: [
                '"' + key + '": "' + value + '",'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + language + chalk.yellow(' not added as a new entity in the menu.\n'));
    }
};

/**
 * A a new entry as a root param in "global.json" translations.
 *
 * @param {string} key - Key for the entry
 * @param {string} value - Default translated value or object with multiple key and translated value
 * @param {string} language - The language to which this translation should be added
 */
Generator.prototype.addGlobalTranslationKey = function (key, value, language) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/global.json';
    try {
        jhipsterUtils.rewriteJSONFile(fullPath, function (jsonObj) {
            jsonObj[key] = value;
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + '(key: ' + key + ', value:' + value + ')' + chalk.yellow(' not added to global translations.\n'));
    }
};

/**
 * Add a translation key to all installed languages
 *
 * @param {string} key - Key for the entity name
 * @param {string} value - Default translated value
 * @param {string} method - The method to be run with provided key and value from above
 * @param {string} enableTranslation - specify if i18n is enabled
 */
Generator.prototype.addTranslationKeyToAllLanguages = function (key, value, method, enableTranslation) {
    if (enableTranslation) {
        this.getAllInstalledLanguages().forEach(function (language) {
            this[method](key, value, language);
        }, this);
    }
};

/**
 * get all the languages installed currently
 */
Generator.prototype.getAllInstalledLanguages = function () {
    var languages = [];
    this.getAllSupportedLanguages().forEach(function (language) {
        try {
            var stats = fs.lstatSync(CLIENT_MAIN_SRC_DIR + 'i18n/' + language);
            if (stats.isDirectory()) {
                languages.push(language);
            }
        } catch (e) {
            // An exception is thrown if the folder doesn't exist
            // do nothing as the language might not be installed
        }
    });
    return languages;
}
/**
 * get all the languages supported by JHipster
 */
Generator.prototype.getAllSupportedLanguages = function () {
    return _.map(this.getAllSupportedLanguageOptions(), 'value');
}
/**
 * check if a language is supported by JHipster
 */
Generator.prototype.isSupportedLanguage = function (language) {
    return _.includes(this.getAllSupportedLanguages(), language);
}
/**
 * get all the languages options supported by JHipster
 */
Generator.prototype.getAllSupportedLanguageOptions = function () {
    return [
        {name: 'Catalan', value: 'ca'},
        {name: 'Chinese (Simplified)', value: 'zh-cn'},
        {name: 'Chinese (Traditional)', value: 'zh-tw'},
        {name: 'Danish', value: 'da'},
        {name: 'Dutch', value: 'nl'},
        {name: 'English', value: 'en'},
        {name: 'French', value: 'fr'},
        {name: 'Galician', value: 'gl'},
        {name: 'German', value: 'de'},
        {name: 'Greek', value: 'el'},
        {name: 'Hindi', value: 'hi'},
        {name: 'Hungarian', value: 'hu'},
        {name: 'Italian', value: 'it'},
        {name: 'Japanese', value: 'ja'},
        {name: 'Korean', value: 'ko'},
        {name: 'Marathi', value: 'mr'},
        {name: 'Polish', value: 'pl'},
        {name: 'Portuguese (Brazilian)', value: 'pt-br'},
        {name: 'Portuguese', value: 'pt-pt'},
        {name: 'Romanian', value: 'ro'},
        {name: 'Russian', value: 'ru'},
        {name: 'Spanish', value: 'es'},
        {name: 'Swedish', value: 'sv'},
        {name: 'Turkish', value: 'tr'},
        {name: 'Tamil', value: 'ta'}
    ];
}

/**
 * Add new social configuration in the "application.yml".
 *
 * @param {string} name - social name (twitter, facebook, ect.)
 * @param {string} clientId - clientId
 * @param {string} clientSecret - clientSecret
 * @param {string} comment - url of how to configure the social service
 */
Generator.prototype.addSocialConfiguration = function (name, clientId, clientSecret, comment) {
    var fullPath = SERVER_MAIN_RES_DIR + 'config/application.yml';
    try {
        this.log(chalk.yellow('   update ') + fullPath);
        var config = '';
        if (comment) {
            config += '# ' + comment + '\n        ';
        }
        config += name + ':\n' +
            '            clientId: ' + clientId + '\n' +
            '            clientSecret: ' + clientSecret + '\n';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-social-configuration',
            splicable: [
                config
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'social configuration ' + name + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new dependency in the "bower.json".
 *
 * @param {string} name - dependency name
 * @param {string} version - dependency version
 */
Generator.prototype.addBowerDependency = function (name, version) {
    var fullPath = 'bower.json';
    try {
        jhipsterUtils.rewriteJSONFile(fullPath, function (jsonObj) {
            jsonObj.dependencies[name] = version;
        }, this);
    } catch (e) {
        console.log(e)
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'bower dependency (name: ' + name + ', version:' + version + ')' + chalk.yellow(' not added.\n'));
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
Generator.prototype.addBowerOverride = function (bowerPackageName, main, isIgnored, dependencies) {
    var fullPath = 'bower.json';
    try {
        jhipsterUtils.rewriteJSONFile(fullPath, function (jsonObj) {
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'bower override configuration (bowerPackageName: ' + bowerPackageName + ', main:' + JSON.stringify(main) + ', ignore:' + isIgnored + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new parameter in the ".bowerrc".
 *
 * @param {string} key - name of the parameter
 * @param {string, obj, bool, etc.} value - value of the parameter
 */
Generator.prototype.addBowerrcParameter = function (key, value) {
    var fullPath = '.bowerrc';
    try {
        this.log(chalk.yellow('   update ') + fullPath);
        jhipsterUtils.rewriteJSONFile(fullPath, function (jsonObj) {
            jsonObj[key] = value;
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ') + 'bowerrc parameter (key: ' + key + ', value:' + value + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new module to the angular application in "app.module.js".
 *
 * @param {string} moduleName - module name
 *
 */
Generator.prototype.addAngularJsModule = function (moduleName) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'app/app.module.js';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-angularjs-add-module',
            splicable: [
                "'" + moduleName + "',"
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + moduleName + chalk.yellow(' not added to JHipster app.\n'));
    }
};

/**
 * Add a new http interceptor to the angular application in "blocks/config/http.config.js".
 * The interceptor should be in its own .js file inside app/blocks/interceptor folder
 * @param {string} interceptorName - angular name of the interceptor
 *
 */
Generator.prototype.addAngularJsInterceptor = function (interceptorName) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'app/blocks/config/http.config.js';
    try {
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-angularjs-add-interceptor',
            splicable: [
                '$httpProvider.interceptors.push(\'' + interceptorName + '\');'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Interceptor not added to JHipster app.\n'));
    }
};

/**
 * A a new changelog to the Liquibase master.xml file.
 *
 * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
 */
Generator.prototype.addChangelogToLiquibase = function (changelogName) {
    try {
        var fullPath = SERVER_MAIN_RES_DIR + 'config/liquibase/master.xml';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-liquibase-add-changelog',
            splicable: [
                '<include file="classpath:config/liquibase/changelog/' + changelogName + '.xml" relativeToChangelogFile="false"/>'
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + changelogName + '.xml ' + chalk.yellow('not added.\n'));
    }
};

/**
 * A a new column to a Liquibase changelog file for entity.
 *
 * @param {string} filePath - The full path of the changelog file.
 * @param {string} content - The content to be added as column, can have multiple columns as well
 */
Generator.prototype.addColumnToLiquibaseEntityChangeset = function (filePath, content) {
    try {
        jhipsterUtils.rewriteFile({
            file: filePath,
            needle: 'jhipster-needle-liquibase-add-column',
            splicable: [
                content
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required jhipster-needle. Column not added.\n') + e);
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
Generator.prototype.addSocialButton = function (isUseSass, socialName, socialParameter, buttonColor, buttonHoverColor) {
    var socialServicefullPath = CLIENT_MAIN_SRC_DIR + 'app/account/social/social.service.js';
    var loginfullPath = CLIENT_MAIN_SRC_DIR + 'app/account/login/login.html';
    var registerfullPath = CLIENT_MAIN_SRC_DIR + 'app/account/register/register.html';
    try {
        this.log(chalk.yellow('\nupdate ') + socialServicefullPath);
        var serviceCode = "case '" + socialName + "': return '" + socialParameter + "';";
        jhipsterUtils.rewriteFile({
            file: socialServicefullPath,
            needle: 'jhipster-needle-add-social-button',
            splicable: [
                serviceCode
            ]
        }, this);

        var buttonCode = '<jh-social ng-provider="' + socialName + '"></jh-social>';
        this.log(chalk.yellow('update ') + loginfullPath);
        jhipsterUtils.rewriteFile({
            file: loginfullPath,
            needle: 'jhipster-needle-add-social-button',
            splicable: [
                buttonCode
            ]
        }, this);
        this.log(chalk.yellow('update ') + registerfullPath);
        jhipsterUtils.rewriteFile({
            file: registerfullPath,
            needle: 'jhipster-needle-add-social-button',
            splicable: [
                buttonCode
            ]
        }, this);

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
        this.addMainCSSStyle(isUseSass, buttonStyle, 'Add sign in style for ' + socialName);

    } catch (e) {
        this.log(chalk.yellow('\nUnable to add social button modification.\n' + e));
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
        this.log(chalk.yellow('\nupdate ') + fullPath);
        var javaImport = 'import ' + importPackagePath + ';\n';
        jhipsterUtils.rewriteFile({
            file: fullPath,
            needle: 'jhipster-needle-add-social-connection-factory-import-package',
            splicable: [
                javaImport
            ]
        }, this);

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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Social connection ') + e + ' ' + chalk.yellow('not added.\n'));
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
Generator.prototype.addMainCSSStyle = function (isUseSass, style, comment) {
    if (isUseSass) {
        this.addMainSCSSStyle(style, comment);
    }

    var fullPath = CLIENT_MAIN_SRC_DIR + 'content/css/main.css';
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Style not added to JHipster app.\n'));
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
Generator.prototype.addMainSCSSStyle = function (style, comment) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'scss/main.scss';
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Style not added to JHipster app.\n'));
    }
};

/**
 * Add a new Maven dependency.
 *
 * @param {string} groupId - dependency groupId
 * @param {string} artifactId - dependency artifactId
 * @param {string} version - explicit dependency version number
 * @param {string} other - explicit other thing: scope, exclusions...
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + 'maven dependency (groupId: ' + groupId + ', artifactId:' + artifactId + ', version:' + version + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * Add a new Maven plugin.
 *
 * @param {string} groupId - plugin groupId
 * @param {string} artifactId - plugin artifactId
 * @param {string} version - explicit plugin version number
 * @param {string} other - explicit other thing: executions, configuration...
 */
Generator.prototype.addMavenPlugin = function (groupId, artifactId, version, other) {
    try {
        var fullPath = 'pom.xml';
        var plugin = '<plugin>\n' +
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + 'maven plugin (groupId: ' + groupId + ', artifactId:' + artifactId + ', version:' + version + ')' + chalk.yellow(' not added.\n'));
    }
};

/**
 * A new Gradle plugin.
 *
 * @param {string} group - plugin GroupId
 * @param {string} name - plugin name
 * @param {string} version - explicit plugin version number
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + 'classpath: ' + group + ':' + name + ':' + version + chalk.yellow(' not added.\n'));
    }
};

/**
 * A new dependency to build.gradle file.
 *
 * @param {string} scope - scope of the new dependency, e.g. compile
 * @param {string} group - maven GroupId
 * @param {string} name - maven ArtifactId
 * @param {string} version - explicit version number
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + group + ':' + name + ':' + version + chalk.yellow(' not added.\n'));
    }
};

/**
 * Apply from an external Gradle build script.
 *
 * @param {string} name - name of the file to apply from, must be 'fileName.gradle'
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
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + name + chalk.yellow(' not added.\n'));
    }
};

/**
 * Generate a date to be used by Liquibase changelogs.
 */
Generator.prototype.dateFormatForLiquibase = function () {
    var now = new Date();
    var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    var year = "" + now_utc.getFullYear();
    var month = "" + (now_utc.getMonth() + 1);
    if (month.length == 1) {
        month = "0" + month;
    }
    var day = "" + now_utc.getDate();
    if (day.length == 1) {
        day = "0" + day;
    }
    var hour = "" + now_utc.getHours();
    if (hour.length == 1) {
        hour = "0" + hour;
    }
    var minute = "" + now_utc.getMinutes();
    if (minute.length == 1) {
        minute = "0" + minute;
    }
    var second = "" + now_utc.getSeconds();
    if (second.length == 1) {
        second = "0" + second;
    }
    return year + "" + month + "" + day + "" + hour + "" + minute + "" + second;
};

/**
 * Copy templates with all the custom logic applied according to the type.
 *
 * @param {string} source - path of the source file to copy from
 * @param {string} dest - path of the destination file to copy to
 * @param {string} action - type of the action to be performed on the template file, i.e: stripHtml | stripJs | template | copy
 * @param {object} _this - context that can be used as the generator instance or data to process template
 * @param {object} _opt - options that can be passed to template method
 * @param {boolean} template - flag to use template method instead of copy method
 */
Generator.prototype.copyTemplate = function (source, dest, action, _this, _opt, template) {

    _this = _this !== undefined ? _this : this;
    _opt = _opt !== undefined ? _opt : {};
    switch (action) {
        case 'stripHtml' :
            var regex = /( translate\="([a-zA-Z0-9](\.)?)+")|( translate-values\="\{([a-zA-Z]|\d|\:|\{|\}|\[|\]|\-|\'|\s|\.)*?\}")|( translate-compile)|( translate-value-max\="[0-9\{\}\(\)\|]*")/g;
            //looks for something like translate="foo.bar.message" and translate-values="{foo: '{{ foo.bar }}'}"
            jhipsterUtils.copyWebResource(source, dest, regex, 'html', _this, _opt, template);
            break;
        case 'stripJs' :
            var regex = /\,[\s\n ]*(resolve)\:[\s ]*[\{][\s\n ]*[a-zA-Z]+\:(\s)*\[[ \'a-zA-Z0-9\$\,\(\)\{\}\n\.\<\%\=\-\>\;\s]*\}\][\s\n ]*\}/g;
            //looks for something like mainTranslatePartialLoader: [*]
            jhipsterUtils.copyWebResource(source, dest, regex, 'js', _this, _opt, template);
            break;
        case 'copy' :
            _this.copy(source, dest);
            break;
        default:
            _this.template(source, dest, _this, _opt);
    }
};

/**
 * Copy html templates after stripping translation keys when translation is disabled.
 *
 * @param {string} source - path of the source file to copy from
 * @param {string} dest - path of the destination file to copy to
 * @param {object} _this - context that can be used as the generator instance or data to process template
 * @param {object} _opt - options that can be passed to template method
 * @param {boolean} template - flag to use template method instead of copy
 */
Generator.prototype.copyHtml = function (source, dest, _this, _opt, template) {
    this.copyTemplate(source, dest, 'stripHtml', _this, _opt, template);
};

/**
 * Copy Js templates after stripping translation keys when translation is disabled.
 *
 * @param {string} source - path of the source file to copy from
 * @param {string} dest - path of the destination file to copy to
 * @param {object} _this - context that can be used as the generator instance or data to process template
 * @param {object} _opt - options that can be passed to template method
 * @param {boolean} template - flag to use template method instead of copy
 */
Generator.prototype.copyJs = function (source, dest, _this, _opt, template) {
    this.copyTemplate(source, dest, 'stripJs', _this, _opt, template);
};

/**
 * Rewrite the specified file with provided content at the needle location
 *
 * @param {string} fullPath - path of the source file to rewrite
 * @param {string} needle - needle to look for where content will be inserted
 * @param {string} content - content to be written
 */
Generator.prototype.rewriteFile = function (filePath, needle, content) {
    try {
        jhipsterUtils.rewriteFile({
            file: filePath,
            needle: needle,
            splicable: [
                content
            ]
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required needle. File rewrite failed.\n'));
    }
};

/**
 * Replace the pattern/regex with provided content
 *
 * @param {string} fullPath - path of the source file to rewrite
 * @param {string} pattern - pattern to look for where content will be replaced
 * @param {string} content - content to be written
 * @param {string} regex - true if pattern is regex
 */
Generator.prototype.replaceContent = function (filePath, pattern, content, regex) {
    try {
        jhipsterUtils.replaceContent({
            file: filePath,
            pattern: pattern,
            content: content,
            regex: regex
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required pattern. File rewrite failed.\n') + e);
    }
};

/**
 * Register a module configuration to .jhipster/modules/jhi-hooks.json
 *
 * @param {string} npmPackageName - npm package name of the generator
 * @param {string} hookFor - from which Jhipster generator this should be hooked ( 'entity' or 'app')
 * @param {string} hookType - where to hook this at the generator stage ( 'pre' or 'post')
 * @param {string} callbackSubGenerator[optional] - sub generator to invoke, if this is not given the module's main generator will be called, i.e app
 * @param {string} description[optional] - description of the generator
 */
Generator.prototype.registerModule = function (npmPackageName, hookFor, hookType, callbackSubGenerator, description) {
    try {
        var modules;
        var error, duplicate;
        var moduleName = _.startCase(npmPackageName.replace('generator-jhipster-', ''));
        var generatorName = npmPackageName.replace('generator-', '');
        var generatorCallback = generatorName + ':' + (callbackSubGenerator ? callbackSubGenerator : 'app');
        var moduleConfig = {
            name: moduleName + ' generator',
            npmPackageName: npmPackageName,
            description: description ? description : 'A JHipster module to generate ' + moduleName,
            hookFor: hookFor,
            hookType: hookType,
            generatorCallback: generatorCallback
        }
        if (shelljs.test('-f', MODULES_HOOK_FILE)) {
            // file is present append to it
            try {
                modules = this.fs.readJSON(MODULES_HOOK_FILE);
                duplicate = _.findIndex(modules, moduleConfig) !== -1;
            } catch (err) {
                error = true;
                this.log(chalk.red('The Jhipster module configuration file could not be read!'));
            }
        } else {
            // file not present create it and add config to it
            modules = [];
        }
        if (!error && !duplicate) {
            modules.push(moduleConfig);
            this.fs.writeJSON(MODULES_HOOK_FILE, modules, null, 4);
        }
    } catch (err) {
        this.log('\n' + chalk.bold.red('Could not add jhipster module configuration'));
    }
};

/**
 * Add configuration to Entity.json files
 *
 * @param {string} file - configuration file name for the entity
 * @param {string} key - key to be added or updated
 * @param {object} value - value to be added
 */
Generator.prototype.updateEntityConfig = function (file, key, value) {

    try {
        var entityJson = this.fs.readJSON(file);
        entityJson[key] = value;
        this.fs.writeJSON(file, entityJson, null, 4);
    } catch (err) {
        this.log(chalk.red('The Jhipster entity configuration file could not be read!') + err);
    }

}

/**
 * get the module hooks config json
 */
Generator.prototype.getModuleHooks = function () {
    var modulesConfig = [];
    try {
        if (shelljs.test('-f', MODULES_HOOK_FILE)) {
            modulesConfig = this.fs.readJSON(MODULES_HOOK_FILE);
        }
    } catch (err) {
        this.log(chalk.red('The module configuration file could not be read!'));
    }

    return modulesConfig;
}

/**
 * get sorted list of entities according to changelog date
 */
Generator.prototype.getExistingEntities = function (warn) {
    var entities = [];
    var unique_dates = new Set();

    function isBefore(e1, e2) {
        return e1.definition.changelogDate - e2.definition.changelogDate;
    }

    if (shelljs.test('-d', JHIPSTER_CONFIG_DIR)) {
        shelljs.ls(path.join(JHIPSTER_CONFIG_DIR, '*.json')).forEach(function (file) {
            var definition = this.fs.readJSON(file);
            unique_dates.add(definition.changelogDate);
            entities.push({name: path.basename(file, '.json'), definition: definition});
        }, this);
    }
    if (entities.length != unique_dates.size) {
        this.log(chalk.yellow('WARNING some of your entities have the same changelog dates so JHipster couldn\'t\n' +
            ' determine the order in which they should be generated. It is recommended to\n' +
            ' edit the changelog dates in the ' + JHIPSTER_CONFIG_DIR + 'folder and to relaunch this\n' +
            ' generator.'));
    }

    return entities.sort(isBefore);
}

Generator.prototype.installI18nClientFilesByLanguage = function (_this, webappDir, lang) {
    this.copyI18nFilesByName(_this, webappDir, 'activate.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'audits.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'configuration.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'error.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'gateway.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'login.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'logs.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'home.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'metrics.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'password.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'register.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'sessions.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'settings.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'reset.json', lang);
    this.copyI18nFilesByName(_this, webappDir, 'user-management.json', lang);

    // tracker.json for Websocket
    if (this.websocket == 'spring-websocket') {
        this.copyI18nFilesByName(_this, webappDir, 'tracker.json', lang);
    }

    if (this.enableSocialSignIn) {
        this.copyI18nFilesByName(_this, webappDir, 'social.json', lang);
    }

    // Templates
    _this.template(webappDir + 'i18n/' + lang + '/_global.json', webappDir + 'i18n/' + lang + '/global.json', this, {});
    _this.template(webappDir + 'i18n/' + lang + '/_health.json', webappDir + 'i18n/' + lang + '/health.json', this, {});


};

Generator.prototype.installI18nServerFilesByLanguage = function (_this, resourceDir, lang) {
    // Template the message server side properties
    var lang_prop = lang.replace(/-/g, "_");
    _this.template(resourceDir + 'i18n/_messages_' + lang_prop + '.properties', resourceDir + 'i18n/messages_' + lang_prop + '.properties', this, {});

};

Generator.prototype.copyI18nFilesByName = function (_this, webappDir, fileToCopy, lang) {
    _this.copy(webappDir + 'i18n/' + lang + '/' + fileToCopy, webappDir + 'i18n/' + lang + '/' + fileToCopy);
};

Generator.prototype.copyI18n = function (language) {
    try {
        this.template(CLIENT_MAIN_SRC_DIR + 'i18n/_entity_' + language + '.json', CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/' + this.entityInstance + '.json', this, {});
        this.addEntityTranslationKey(this.entityTranslationKeyMenu, this.entityClass, language);
    } catch (e) {
        // An exception is thrown if the folder doesn't exist
        // do nothing
    }
};

Generator.prototype.copyEnumI18n = function (language, enumInfo) {
    try {
        this.template(CLIENT_MAIN_SRC_DIR + 'i18n/_enum_' + language + '.json', CLIENT_MAIN_SRC_DIR + 'i18n/' + language + '/' + enumInfo.enumInstance + '.json', enumInfo, {});
    } catch (e) {
        // An exception is thrown if the folder doesn't exist
        // do nothing
    }
};

Generator.prototype.updateLanguagesInLanguageConstant = function (languages) {
    var fullPath = CLIENT_MAIN_SRC_DIR + 'app/components/language/language.constants.js';
    try {
        var content = ".constant('LANGUAGES', [\n";
        for (var i = 0, len = languages.length; i < len; i++) {
            var language = languages[i];
            content += "            '" + language + "'" + (i != languages.length - 1 ? "," : "") + "\n";
        }
        content +=
            "            // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n" +
            "        ]";

        jhipsterUtils.replaceContent({
            file: fullPath,
            pattern: /\.constant.*LANGUAGES.*\[([^\]]*jhipster-needle-i18n-language-constant[^\]]*)\]/g,
            content: content
        }, this);
    } catch (e) {
        this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. LANGUAGE constant not updated with languages: ') + languages + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n'));
    }
};

Generator.prototype.getTableName = function (value) {
    return _.snakeCase(value).toLowerCase();
};

Generator.prototype.getColumnName = function (value) {
    return _.snakeCase(value).toLowerCase();
};

Generator.prototype.insight = function () {
    var insight = new Insight({
        trackingCode: 'UA-46075199-2',
        packageName: packagejs.name,
        packageVersion: packagejs.version
    });
    return insight;
}

Generator.prototype.removefile = function (file) {
    if (shelljs.test('-f', file)) {
        this.log('Removing the file - ' + file);
        shelljs.rm(file);
    }
}

Generator.prototype.removefolder = function (folder) {
    if (shelljs.test('-d', folder)) {
        this.log('Removing the folder - ' + folder)
        shelljs.rm("-rf", folder);
    }
}

Generator.prototype.isJhipsterVersionLessThan = function (version) {
    var jhipsterVersion = this.config.get('jhipsterVersion');
    if (!jhipsterVersion) {
        return true;
    }
    return semver.lt(jhipsterVersion, version);
}

Generator.prototype.getDefaultAppName = function () {
    return (/^[a-zA-Z0-9_]+$/.test(path.basename(process.cwd()))) ? path.basename(process.cwd()) : 'jhipster';
};

Generator.prototype.formatAsClassJavadoc = function (text) {
    return '/**' + wordwrap(text, WORD_WRAP_WIDTH - 4, '\n * ', false) + '\n */';
};

Generator.prototype.formatAsFieldJavadoc = function (text) {
    return '    /**' + wordwrap(text, WORD_WRAP_WIDTH - 8, '\n     * ', false) + '\n     */';
};

Generator.prototype.formatAsApiModel = function (text) {
    return wordwrap(text.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'), WORD_WRAP_WIDTH - 9, '"\n    + "', true)
};

Generator.prototype.formatAsApiModelProperty = function (text) {
    return wordwrap(text.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"'), WORD_WRAP_WIDTH - 13, '"\n        + "', true)
};

Generator.prototype.printJHipsterLogo = function () {
    this.log(' \n' +
        chalk.green('        ██') + chalk.red('  ██    ██  ████████  ███████    ██████  ████████  ████████  ███████\n') +
        chalk.green('        ██') + chalk.red('  ██    ██     ██     ██    ██  ██          ██     ██        ██    ██\n') +
        chalk.green('        ██') + chalk.red('  ████████     ██     ███████    █████      ██     ██████    ███████\n') +
        chalk.green('  ██    ██') + chalk.red('  ██    ██     ██     ██             ██     ██     ██        ██   ██\n') +
        chalk.green('   ██████ ') + chalk.red('  ██    ██  ████████  ██        ██████      ██     ████████  ██    ██\n'));
    this.log(chalk.white.bold('                            http://jhipster.github.io\n'));
    this.log(chalk.white('Welcome to the JHipster Generator ') + chalk.yellow('v' + packagejs.version));
    this.log(chalk.white('Application files will be generated in folder: ' + chalk.yellow(process.cwd())));
};

Generator.prototype.getAngularAppName = function () {
    return _.camelCase(this.baseName, true) + (this.baseName.endsWith('App') ? '' : 'App');
};

Generator.prototype.getMainClassName = function () {
    return _.upperFirst(this.getAngularAppName());
};

Generator.prototype.askModuleName = function (generator, currentQuestion, totalQuestions) {

    var done = generator.async();
    var defaultAppBaseName = this.getDefaultAppName();
    var getNumberedQuestion = this.getNumberedQuestion;
    generator.prompt({
        type: 'input',
        name: 'baseName',
        validate: function (input) {
            if (/^([a-zA-Z0-9_]*)$/.test(input) && input != 'application') return true;
            if (input == 'application') {
                return 'Your application name cannot be named \'application\' as this is a reserved name for Spring Boot';
            }
            return 'Your application name cannot contain special characters or a blank space, using the default name instead';
        },
        message: function (response) {
            return getNumberedQuestion('What is the base name of your application?', currentQuestion, totalQuestions, function (current) {
                currentQuestion = current;
            }, true);
        },
        default: defaultAppBaseName
    }, function (prompt) {
        generator.baseName = prompt.baseName;
        done();
    }.bind(generator));
};

Generator.prototype.aski18n = function (generator, currentQuestion, totalQuestions) {

    var languageOptions = this.getAllSupportedLanguageOptions();
    var getNumberedQuestion = this.getNumberedQuestion;

    var done = generator.async();
    var prompts = [
        {
            type: 'confirm',
            name: 'enableTranslation',
            message: function (response) {
                return getNumberedQuestion('Would you like to enable internationalization support?', currentQuestion, totalQuestions, function (current) {
                    currentQuestion = current;
                }, true);
            },
            default: true
        },
        {
            when: function (response) {
                return response.enableTranslation === true;
            },
            type: 'list',
            name: 'nativeLanguage',
            message: 'Please choose the native language of the application?',
            choices: languageOptions,
            default: 'en',
            store: true
        },
        {
            when: function (response) {
                return response.enableTranslation === true;
            },
            type: 'checkbox',
            name: 'languages',
            message: 'Please choose additional languages to install',
            choices: function (response) {
                return _.filter(languageOptions, function (o) {
                    return o.value !== response.nativeLanguage;
                });
            }
        }
    ];

    generator.prompt(prompts, function (prompt) {
        generator.enableTranslation = prompt.enableTranslation;
        generator.nativeLanguage = prompt.nativeLanguage;
        generator.languages = [prompt.nativeLanguage].concat(prompt.languages);
        done();
    }.bind(generator));
};

Generator.prototype.composeLanguagesSub = function (generator, configOptions, type) {
    if (generator.enableTranslation) {
        // skip server if app type is client
        var skipServer = type && type === 'client';
        // skip client if app type is server
        var skipClient = type && type === 'server';
        generator.composeWith('jhipster:languages', {
            options: {
                'skip-install': true,
                'skip-server': skipServer,
                'skip-client': skipClient,
                configOptions: configOptions
            },
            args: generator.languages
        }, {
            local: require.resolve('./languages')
        });
    }
};

Generator.prototype.getNumberedQuestion = function (msg, currentQuestion, totalQuestions, cb, cond) {
    var order;
    if (cond) {
        ++currentQuestion;
    }
    order = '(' + currentQuestion + '/' + totalQuestions + ') ';
    cb(currentQuestion);
    return order + msg;
},

Generator.prototype.contains = _.includes;

var wordwrap = function (text, width, seperator, keepLF) {
    var wrappedText = '';
    var rows = text.split('\n');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (keepLF == true && i != 0) {
            wrappedText = wrappedText + '\\n';
        }
        wrappedText = wrappedText + seperator + _.padEnd(row,width) + seperator;
    }
    return wrappedText;
}
