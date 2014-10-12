'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base');

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    var name = this._qualifiedName(this.name);
    console.info(name);
    this.entityPackage = name.packageName;
    this.entityClass = name.className;
    
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.javaVersion = this.config.get('javaVersion');
    this.hibernateCache = this.config.get('hibernateCache');
    this.databaseType = this.config.get('databaseType');
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';

    // Specific Entity sub-generator variables
    this.fields = [];
    this.fieldsContainLocalDate = false;
    this.relationships = [];
    
    console.log(chalk.red('The entity ' + this.entityClass + ' is being created' + (this.entityPackage ? ' in package ' + this.entityPackage : '') + '.'));
};

var fieldNames = ['id'];

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);

EntityGenerator.prototype.qualifiedNameMatcher = /^(?:([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\.)?([a-zA-Z_$][a-zA-Z0-9_$]*)$/;

EntityGenerator.prototype._qualifiedName = function _qualifiedName(name) {
    var match = this.qualifiedNameMatcher.exec(name);
    return {
        packageName: match[1],
        className: match[2]
    };
}

EntityGenerator.prototype._printEntity = function _printEntity() {
    console.log(chalk.red('===========' + this.makePackage(this.entityPackage, this.entityName) + '=============='));
    for (var id in this.fields) {
        var item = this.fields[id];
        console.log(chalk.red(item.fieldName + ' (' + item.fieldType + ')'));
    }
    console.log(chalk.red('-------------------'));
    for (var id in this.relationships) {
        var item = this.relationships[id];
        console.log(chalk.red(item.relationshipName + " " + this.makePackage(item.otherEntityPackage, item.otherEntityClass) + ' (' + item.relationshipType + ')'));
    }
}

EntityGenerator.prototype.askForPackage = function askForPackage() {
    if(!this.entityPackage) {
        console.info(this.entityPackage);
        var done = this.async();
        var prompts = [{
            type: 'input',
            name: 'entityPackage',
            validate: function (input) {
                return /^([a-zA-Z0-9_]*)$/.test(input) || 'Your sub-package name cannot contain special characters';
            },
            message: 'What is the name of the sub-package of your entity?',
            default: ''
        }];
        this.prompt(prompts, function (props) {
            this.entityPackage = props.entityPackage;
            done();
        }.bind(this));
    }
}

EntityGenerator.prototype.askForFields = function askForFields() {
    var done = this.async();
    var fieldId = this.fields.length + 1;
    console.log(chalk.green('Generating field #' + fieldId));
    var prompts = [
        {
            type: 'confirm',
            name: 'fieldAdd',
            message: 'Do you want to add a field to your entity?',
            default: true
        },
        {
            when: function (response) {
                return response.fieldAdd == true;
            },
            type: 'input',
            name: 'fieldName',
            validate: function (input) {
                return ((/^([a-zA-Z0-9_]+)$/.test(input)) && input != 'id' && fieldNames.indexOf(input) == -1) ||
                    'Your field name cannot contain special characters or use an already existing field name';
            },
            message: 'What is the name of your field #' + fieldId + '?'
        },
        {
            when: function (response) {
                return response.fieldAdd == true;
            },
            type: 'list',
            name: 'fieldType',
            message: 'What is the type of your field #' + fieldId + '?',
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
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.fieldAdd) {
            var field = {
                fieldId: fieldId,
                fieldName: props.fieldName,
                fieldType: props.fieldType,
                fieldNameCapitalized: _s.capitalize(props.fieldName),
                fieldNameUnderscored: _s.underscored(props.fieldName)
            };

            fieldNames.push(props.fieldName);
            this.fields.push(field);
            if (props.fieldType == 'LocalDate') {
                this.fieldsContainLocalDate = true;
            }
        }
        this._printEntity();
        if (props.fieldAdd) {
            this.askForFields();
        } else {
            done();
        }
    }.bind(this));
};

EntityGenerator.prototype.askForRelationships = function askForRelationships() {
    if (this.databaseType == 'nosql') {
        return;
    }
    var packageFolder = this.packageFolder;
    var done = this.async();
    var relationshipId =  this.relationships.length + 1;
    console.log(chalk.green('Generating relationships with other entities'));
    var prompts = [
        {
            type: 'confirm',
            name: 'relationshipAdd',
            message: 'Do you want to add a relationship to another entity?',
            default: true
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'input',
            name: 'otherEntityType',
            validate: function (input) {
                if (EntityGenerator.prototype.qualifiedNameMatcher.test(input)) return true;
                return 'Your class name cannot contain special characters';
            },
            message: 'What is the class of the other entity?'
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'input',
            name: 'relationshipName',
            validate: function (input) {
                if ((/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) && input != 'id' && fieldNames.indexOf(input) == -1) return true;
                return 'Your relationship name cannot contain special characters or use an already existing field name';
            },
            message: 'What is the name of the relationship?',
            default : function(response) {
                var name = EntityGenerator.prototype._qualifiedName(response.otherEntityType);
                return name.className.charAt(0).toLowerCase() + name.className.slice(1);
            }
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'list',
            name: 'relationshipType',
            message: 'What is the type of the relationship?',
            choices: [
                {
                    value: 'one-to-many',
                    name: 'one-to-many'
                },
                {
                    value: 'many-to-one',
                    name: 'many-to-one'
                }
            ],
            default: 0
        },
        {
            when: function(response) {
                return (response.relationshipAdd == true && response.relationshipType == 'many-to-one' && !shelljs.test('-f', 'src/main/java/' + packageFolder + '/domain/' + _s.capitalize(response.otherEntityName) + '.java'))
            },
            type: 'confirm',
            name: 'noOtherEntity',
            message: 'WARNING! You are trying to generate a many-to-one relationship on an entity that does not exist. This will probably fail, as you will need to create a foreign key on a table that does not exist. We advise you to create the other side of this relationship first (do the one-to-many before the many-to-one relationship). Are you sure you want to continue?',
            default: false
        },
        {
            when: function (response) {
                return (response.relationshipAdd == true && response.relationshipType == 'many-to-one');
            },
            type: 'input',
            name: 'otherEntityField',
            message: function (response) {
                return 'When you display this relationship with AngularJS, which field from \'' + response.otherEntityName + '\' do you want to use?'
            },
            default: 'id'
        },
        {
            when: function (response) {
                return (response.relationshipAdd == true && response.relationshipType == 'many-to-many');
            },
            type: 'confirm',
            name: 'ownerSide',
            message: 'Is this entity the owner of the relationship?',
            default: false
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.noOtherEntity == false) {
            console.log(chalk.red('Generation aborted, as requested by the user.'));
            return;
        }
        if (props.relationshipAdd) {
            var name = this._qualifiedName(props.otherEntityType);
            var relationship = {
                relationshipId: relationshipId,
                relationshipName: props.relationshipName,
                relationshipType: props.relationshipType,
                otherEntityPackage: name.packageName,
                otherEntityClass: name.className,
                otherEntityField: props.otherEntityField
            }
            this.relationships.push(relationship);
        }
        this._printEntity();
        if (props.relationshipAdd) {
            this.askForRelationships();
        } else {
            console.log(chalk.green('Everything is configured, generating the entity...'));
            done();
        }
    }.bind(this));
};

EntityGenerator.prototype.files = function files() {
    this.entityInstance = this.entityClass.toLowerCase();
    this.entityPackageSuffix = this.entityPackage ? '.' + this.entityPackage : '';
    var entityPath = this.entityPackage ? this.entityPackage.replace(/\./g, '/') + '/' : '';
    var entityFile = entityPath + this.entityClass;
    var entityFolder = entityPath + this.entityInstance;
    var resourceDir = 'src/main/resources/';

    this.template('src/main/java/package/domain/_Entity.java',
        'src/main/java/' + this.packageFolder + '/domain/' + entityFile + '.java');

    this.template('src/main/java/package/repository/_EntityRepository.java',
        'src/main/java/' + this.packageFolder + '/repository/' + entityFile + 'Repository.java');

    this.template('src/main/java/package/web/rest/_EntityResource.java',
        'src/main/java/' + this.packageFolder + '/web/rest/' + entityFile + 'Resource.java');

    if (this.databaseType == "sql") {
        this.changelogDate = this.dateFormatForLiquibase();
        this.template(resourceDir + '/config/liquibase/changelog/_added_entity.xml',
            resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml');

        this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
    }

    this.template('src/main/webapp/views/_entities.html',
        'src/main/webapp/views/' + entityFolder + 's.html');

    this.template('src/main/webapp/scripts/_entity-router.js',
        'src/main/webapp/scripts/' + entityFolder + '/router_' + this.entityInstance+'.js');
    this.addScriptToIndex(entityFolder + '/router_' + this.entityInstance + '.js');
    this.addRouterToMenu(this.entityInstance);

    this.template('src/main/webapp/scripts/_entity-controller.js',
        'src/main/webapp/scripts/' + entityFolder + '/controller_' + this.entityInstance + '.js');
    this.addScriptToIndex(entityFolder + '/controller_' + this.entityInstance+'.js');

    this.template('src/main/webapp/scripts/_entity-service.js',
        'src/main/webapp/scripts' + entityFolder + '/service_' + this.entityInstance+'.js');
    this.addScriptToIndex(entityFolder + '/service_' + this.entityInstance+'.js');

    this.template('src/test/java/package/web/rest/_EntityResourceTest.java',
        'src/test/java/' + this.packageFolder + '/web/rest/' + entityFile + 'ResourceTest.java');
};

