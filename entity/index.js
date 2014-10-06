'use strict';
var util = require('util'),
        path = require('path'),
        yeoman = require('yeoman-generator'),
        chalk = require('chalk'),
        _s = require('underscore.string'),
        scriptBase = require('../script-base');

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    console.log('The entity ' + this.name + ' is being created.');
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.javaVersion = this.config.get('javaVersion');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';

    // Specific Entity sub-generator variables
    this.fieldId = 0;
    this.fields = [];
    this.fieldsContainLocalDate = false;
};

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);

EntityGenerator.prototype.askFor = function askFor() {
    var cb = this.async();
    this.fieldId++;
    console.log(chalk.green('Generating field #' + this.fieldId));
    var prompts = [
        {
            type: 'input',
            name: 'fieldName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your field name cannot contain special characters or a blank space';
            },
            message: 'What is the name of your field?'
        },
        {
            type: 'list',
            name: 'fieldType',
            message: 'What is the type of your field?',
            choices: [
                {
                    value: 'String',
                    name: 'String'
                },
                {
                    value: 'Integer',
                    name: 'Integer'
                },
                {
                    value: 'Long',
                    name: 'Long'
                },
                {
                    value: 'LocalDate',
                    name: 'LocalDate'
                },
                {
                    value: 'Boolean',
                    name: 'Boolean'
                }
            ],
            default: 0
        },
        {
            type: 'confirm',
            name: 'fieldNext',
            message: 'Do you want to add another field?',
            default: true
        }
    ];
    this.prompt(prompts, function (props) {
        var field = {fieldId: this.fieldId,
            fieldName: props.fieldName,
            fieldType: props.fieldType,
            fieldNameCapitalized: _s.capitalize(props.fieldName),
            fieldNameUnderscored: _s.underscored(props.fieldName)}

        this.fields.push(field);
        if (props.fieldType == 'LocalDate') {
            this.fieldsContainLocalDate = true;
        }

        if (props.fieldNext) {
            console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
            for (var id in this.fields) {
                console.log(chalk.red(this.fields[id].fieldName + ' (' + this.fields[id].fieldType + ')'));
            }
            this.askFor();
        } else {
            cb();
        }

    }.bind(this));
};


EntityGenerator.prototype.files = function files() {

    this.entityClass = _s.capitalize(this.name);
    this.entityInstance = this.name.toLowerCase();
    var resourceDir = 'src/main/resources/';

    this.template('src/main/java/package/domain/_Entity.java',
        'src/main/java/' + this.packageFolder + '/domain/' +    this.entityClass + '.java');

    this.template('src/main/java/package/repository/_EntityRepository.java',
        'src/main/java/' + this.packageFolder + '/repository/' +    this.entityClass + 'Repository.java');

    this.template('src/main/java/package/web/rest/_EntityResource.java',
        'src/main/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'Resource.java');

    if (this.databaseType == "sql") {
        this.changelogDate = this.dateFormatForLiquibase();
        this.template(resourceDir + '/config/liquibase/changelog/_added_entity.xml',
            resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml');

        this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
    }

    this.template('src/main/webapp/views/_entities.html',
        'src/main/webapp/views/' +    this.entityInstance + 's.html');

    this.template('src/main/webapp/scripts/_entity-router.js',
        'src/main/webapp/scripts/' +    this.entityInstance + '/router_'+this.entityInstance+'.js');
    this.addScriptToIndex(this.entityInstance + '/router_'+this.entityInstance+'.js');
    this.addRouterToMenu(this.entityInstance);

    this.template('src/main/webapp/scripts/_entity-controller.js',
        'src/main/webapp/scripts/' +    this.entityInstance + '/controller_'+this.entityInstance+'.js');
    this.addScriptToIndex(this.entityInstance + '/controller_'+this.entityInstance+'.js');

    this.template('src/main/webapp/scripts/_entity-service.js',
        'src/main/webapp/scripts/' +    this.entityInstance + '/service_'+this.entityInstance+'.js');
    this.addScriptToIndex(this.entityInstance + '/service_'+this.entityInstance+'.js');

    this.template('src/test/java/package/web/rest/_EntityResourceTest.java',
        'src/test/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'ResourceTest.java');

};
