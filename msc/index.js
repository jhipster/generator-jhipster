'use strict';
var util = require('util'),
        path = require('path'),
        yeoman = require('yeoman-generator'),
        chalk = require('chalk'),
        _s = require('underscore.string'),
        shelljs = require('shelljs'),
        scriptBase = require('../script-base');

var MscGenerator = module.exports = function MscGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.useConfigurationFile =false;
    if (shelljs.test('-f', '.jhipster.' + this.name + '.json')) {
        console.log(chalk.green('Found the .jhipster.' + this.name + '.json configuration file, automatically generating the entity'));
        try {
            this.fileData = JSON.parse(this.readFileAsString('.jhipster.' + this.name + '.json'))
        } catch (err) {
            console.log(chalk.red('The configuration file could not be read!'));
            return;
        }
        this.useConfigurationFile = true;
    }
    
    this.filenameInheritance = '.jhipster.inheritance.table.json';
    this.inheritances = {};
    if (shelljs.test('-f', this.filenameInheritance)) {
        console.log(chalk.green('Found the '+ this.filenameInheritance +' configuration file'));
        try {
            this.inheritances = JSON.parse(this.readFileAsString(this.filenameInheritance))
        } catch (err) {
            console.log(chalk.red('The configuration file could not be read!'));
            return;
        }
    } else {
    	this.inheritances.entity = ['Authority', 'User'];
    	this.inheritances.msc = ['AbstractAuditingEntity'];
    }
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
    this.inheritanceFor = false;
    this.inheritanceFromClass = '';   
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

util.inherits(MscGenerator, yeoman.generators.Base);
util.inherits(MscGenerator, scriptBase);

function removefile(file) {
    console.log('Remove the file - ' + file)
    if (shelljs.test('-f', file)) {
        shelljs.rm(file);
    }

}


MscGenerator.prototype.askForInheritanceFrom = function askForInheritanceFrom() {
	if (this.useConfigurationFile == true || this.inheritanceFor == true) {// don't prompt if data are imported from a file
        return;
    }
    var cb = this.async();
    console.log(chalk.green('Generating inheritance #'));
    var choicesArr = this.inheritances.entity;
    choicesArr = choicesArr.concat(this.inheritances.msc);
    var prompts = [
        {
            type: 'confirm',
            name: 'inheritanceFromAdd',
            message: 'Would like your MappedSuperclass to inherit from an existing class?',
            default: false
        },
        {
            when: function (response) {
                return response.inheritanceFromAdd == true;
            },
            type: 'list',
            name: 'inheritanceFromClass',
            message: 'Which class would you like to extend?',
            choices: choicesArr,
            default: 0
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.inheritanceFromAdd) {
            this.inheritanceFromClass = props.inheritanceFromClass;
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        if (props.inheritanceFromAdd) {
            this.askForFields();
        } else {
            cb();
        }
    }.bind(this));
}

MscGenerator.prototype.askForFields = function askForFields() {
    if (this.useConfigurationFile == true) {// don't prompt if data are imported from a file
        return;
    }
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


MscGenerator.prototype.searchBaseTable = function searchBaseTable(entity, obj) {
	var baseEntityData = '';
	var filename = '.jhipster.' + entity + '.json';
	try {
        baseEntityData = JSON.parse(obj.readFileAsString(filename));
    } catch (err) {
        return;
    }
    var baseEntity = baseEntityData.inheritanceFromClass;
    if (baseEntity.length !== 0 && obj.inheritances.msc.indexOf(baseEntity) == -1){
    	return searchBaseTable(baseEntity, obj);
    } else {
    	return entity;
    }
};


MscGenerator.prototype.getInheritedFields = function getInheritedFields(entity, fields, obj) {
	var baseEntityData = '';
	var filename = '.jhipster.' + entity + '.json';
	try {
        baseEntityData = JSON.parse(obj.readFileAsString(filename));
    } catch (err) {
        return;
    }
    var baseEntity = baseEntityData.inheritanceFromClass;
    fields = fields.concat(baseEntityData.fields);
    if (baseEntity.length !== 0) {
    	return getInheritedFields(baseEntity, fields, obj);
    } else {
    	return fields;
    }
};

MscGenerator.prototype.files = function files() {
    if (this.databaseType == "sql") {
        this.changelogDate = this.dateFormatForLiquibase();
    }
    this.name = _s.capitalize(this.name);
    if (this.useConfigurationFile == false) { // store informations in a file for further use.
        this.data = {};
        this.data.entityType = 'msc';
        this.data.inheritanceFor = true;
        this.data.inheritanceFromClass = this.inheritanceFromClass;
        this.data.relationships = this.relationships;
        this.data.fields = this.fields;
        this.data.fieldNamesUnderscored = this.fieldNamesUnderscored;
        this.data.fieldsContainOwnerManyToMany = this.fieldsContainOwnerManyToMany;
        this.data.fieldsContainOneToMany = this.fieldsContainOneToMany;
        this.data.fieldsContainLocalDate = this.fieldsContainLocalDate;
        this.data.fieldsContainCustomTime = this.fieldsContainCustomTime;
        this.data.fieldsContainBigDecimal = this.fieldsContainBigDecimal;
        this.data.fieldsContainDateTime = this.fieldsContainDateTime;
        this.data.changelogDate = this.changelogDate;
        this.filename = '.jhipster.' + this.name + '.json';
        this.write(this.filename, JSON.stringify(this.data, null, 4));
        this.inheritances.msc.push(this.name);
    } else  {
    	this.entityType = this.fileData.entityType;
    	this.inheritanceFor = this.fileData.inheritanceFor;
    	this.inheritanceFromClass = this.fileData.ingeritanceFromClass;
        this.relationships = this.fileData.relationships;
        this.fields = this.fileData.fields;
        this.fieldNamesUnderscored = this.fileData.fieldNamesUnderscored;
        this.fieldsContainOwnerManyToMany = this.fileData.fieldsContainOwnerManyToMany;
        this.fieldsContainOneToMany = this.fileData.fieldsContainOneToMany;
        this.fieldsContainLocalDate = this.fileData.fieldsContainLocalDate;
        this.fieldsContainCustomTime = this.fileData.fieldsContainCustomTime;
        this.fieldsContainBigDecimal = this.fileData.fieldsContainBigDecimal;
        this.fieldsContainDateTime = this.fileData.fieldsContainDateTime;
        this.changelogDate = this.fileData.changelogDate;
    }
    
    this.entityClass = _s.capitalize(this.name);
    this.entityInstance = this.name.charAt(0).toLowerCase() + this.name.slice(1);
    var resourceDir = '../../entity/templates/src/main/resources/';

    this.template('../../entity/templates/src/main/java/package/domain/_Msc.java',
        'src/main/java/' + this.packageFolder + '/domain/' +    this.entityClass + '.java', this, {});
    
    removefile(this.filenameInheritance);
    this.write(this.filenameInheritance, JSON.stringify(this.inheritances, null, 4));

//    this.template('src/main/java/package/repository/_EntityRepository.java',
//        'src/main/java/' + this.packageFolder + '/repository/' +    this.entityClass + 'Repository.java', this, {});
//
//    this.template('src/main/java/package/web/rest/_EntityResource.java',
//        'src/main/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'Resource.java', this, {});
//
//    if (this.databaseType == "sql") {
//    	if(this.inheritanceFromClass != '') {
//    		this.baseTable = this.searchBaseTable(this.inheritanceFromClass, this);
//    		this.template(resourceDir + '/config/liquibase/changelog/_added_inherited_entity.xml',
//    	        resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_inherited_entity_' + this.entityClass + '.xml', this, {});
//    	
//    	    this.addChangelogToLiquibase(this.changelogDate + '_added_inherited_entity_' + this.entityClass);
//    	} else {
//	        this.template(resourceDir + '/config/liquibase/changelog/_added_entity.xml',
//	            resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, {});
//	
//	        this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
//    	}
//    }
    
    // after generating Liquibase we can merge fields from all inherited classes
//    this.fields = this.getInheritedFields(this.inheritanceFromClass, this.fields, this);
//
//    this.template('src/main/webapp/app/_entities.html',
//        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + 's.html', this, {});
//
//    this.addRouterToMenu(this.entityInstance);
//
//    this.template('src/main/webapp/app/_entity.js',
//        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.js', this, {});
//    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.js');
//    this.template('src/main/webapp/app/_entity-controller.js',
//        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.controller' + '.js', this, {});
//    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.controller' + '.js');
//
//    this.template('src/main/webapp/components/_entity-service.js',
//        'src/main/webapp/scripts/components/entities/' + this.entityInstance + '/' + this.entityInstance + '.service' + '.js', this, {});
//    this.addComponentsScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.service' + '.js');
//
//    this.template('src/test/java/package/web/rest/_EntityResourceTest.java',
//        'src/test/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'ResourceTest.java', this, {});
};
