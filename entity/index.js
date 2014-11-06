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
    console.log(chalk.red('The entity ' + this.name + ' is being created.'));
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
    this.fieldsContainDateTime = false;
    this.fieldsContainCustomTime = false;
    this.fieldsContainBigDecimal = false;
    this.fieldsContainOwnerManyToMany = false;
    this.fieldsContainOneToMany = false;
    this.relationshipId = 0;
    this.relationships = [];
};

var fieldNamesUnderscored = ['id'];

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);

EntityGenerator.prototype.askForFields = function askForFields() {
    var cb = this.async();
    this.fieldId++;
    console.log(chalk.green('Generating field #' + this.fieldId));
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
                if ((/^([a-zA-Z0-9_]*)$/.test(input)) && input != '' && input != 'id' && fieldNamesUnderscored.indexOf(_s.underscored(input)) == -1) return true;
                return 'Your field name cannot contain special characters or use an already existing field name';
            },
            message: 'What is the name of your field?'
        },
        {
            when: function (response) {
                return response.fieldAdd == true;
            },
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
                    value: 'BigDecimal',
                    name: 'BigDecimal'
                },
                {
                    value: 'LocalDate',
                    name: 'LocalDate'
                },
                {
                    value: 'DateTime',
                    name: 'DateTime'
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
            var field = {fieldId: this.fieldId,
                fieldName: props.fieldName,
                fieldType: props.fieldType,
                fieldNameCapitalized: _s.capitalize(props.fieldName),
                fieldNameUnderscored: _s.underscored(props.fieldName)}

            fieldNamesUnderscored.push(_s.underscored(props.fieldName));
            this.fields.push(field);
            if (props.fieldType == 'LocalDate') {
                this.fieldsContainLocalDate = true;
                this.fieldsContainCustomTime = true;
            }
            if (props.fieldType == 'BigDecimal') {
                this.fieldsContainBigDecimal = true;
            }
            if (props.fieldType == 'DateTime') {
                this.fieldsContainDateTime = true;
                this.fieldsContainCustomTime = true;
            }
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        for (var id in this.fields) {
            console.log(chalk.red(this.fields[id].fieldName + ' (' + this.fields[id].fieldType + ')'));
        }
        if (props.fieldAdd) {
            this.askForFields();
        } else {
            cb();
        }
    }.bind(this));
};

EntityGenerator.prototype.askForRelationships = function askForRelationships() {
    if (this.databaseType == 'nosql') {
        return;
    }
    var packageFolder = this.packageFolder;
    var cb = this.async();
    this.relationshipId++;
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
            name: 'otherEntityName',
            validate: function (input) {
                if ((/^([a-zA-Z0-9_]*)$/.test(input)) && input != '' && input != 'id' && fieldNamesUnderscored.indexOf(_s.underscored(input)) == -1) return true;
                return 'Your relationship name cannot contain special characters or use an already existing field name';
            },
            message: 'What is the name of the other entity?'
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
                },
                {
                    value: 'many-to-many',
                    name: 'many-to-many'
                },
                {
                    value: 'one-to-one',
                    name: 'one-to-one'
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
                return (response.relationshipAdd == true && (response.relationshipType == 'many-to-many' || response.relationshipType == 'one-to-one'));
            },
            type: 'confirm',
            name: 'ownerSide',
            message: 'Is this entity the owner of the relationship?',
            default: false
        },
        {
            when: function(response) {
                return (response.relationshipAdd == true && response.ownerSide == true && !shelljs.test('-f', 'src/main/java/' + packageFolder + '/domain/' + _s.capitalize(response.otherEntityName) + '.java'))
            },
            type: 'confirm',
            name: 'noOtherEntity2',
            message: 'WARNING! You have selected that this entity is the owner of a relationship on another entity, that does not exist yet. This will probably fail, as you will need to create a foreign key on a table that does not exist. We advise you to create the other side of this relationship first (do the non-owning side before the owning side). Are you sure you want to continue?',
            default: false
        },
        {
            when: function (response) {
                return (!(response.noOtherEntity == false || response.noOtherEntity2 == false) && response.relationshipAdd == true && (response.relationshipType == 'many-to-one' || (response.relationshipType == 'many-to-many' && response.ownerSide == true)));
            },
            type: 'input',
            name: 'otherEntityField',
            message: function (response) {
                return 'When you display this relationship with AngularJS, which field from \'' + response.otherEntityName + '\' do you want to use?'
            },
            default: 'id'
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.noOtherEntity == false || props.noOtherEntity2 == false) {
            console.log(chalk.red('Generation aborted, as requested by the user.'));
            return;
        }
        if (props.relationshipAdd) {
            var relationship = {relationshipId: this.relationshipId,
                otherEntityName: props.otherEntityName.charAt(0).toLowerCase() + props.otherEntityName.slice(1),
                relationshipType: props.relationshipType,
                otherEntityNameCapitalized: _s.capitalize(props.otherEntityName),
                otherEntityField: props.otherEntityField,
                ownerSide: props.ownerSide}

            if (props.relationshipType == 'many-to-many' && props.ownerSide == true) {
                this.fieldsContainOwnerManyToMany = true;
            }
            if (props.relationshipType == 'one-to-many') {
                this.fieldsContainOneToMany = true;
            }
            fieldNamesUnderscored.push(_s.underscored(props.otherEntityName));
            this.relationships.push(relationship);
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        for (var id in this.fields) {
            console.log(chalk.red(this.fields[id].fieldName + ' (' + this.fields[id].fieldType + ')'));
        }
        console.log(chalk.red('-------------------'));
        for (var id in this.relationships) {
            console.log(chalk.red(this.relationships[id].otherEntityName + ' (' + this.relationships[id].relationshipType + ')'));
        }
        if (props.relationshipAdd) {
            this.askForRelationships();
        } else {
            console.log(chalk.green('Everything is configured, generating the entity...'));
            cb();
        }
    }.bind(this));
};


EntityGenerator.prototype.files = function files() {

    this.entityClass = _s.capitalize(this.name);
    this.entityInstance = this.name.charAt(0).toLowerCase() + this.name.slice(1);
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
