'use strict';
var util = require('util'),
        fs = require('fs'),
        path = require('path'),
        yeoman = require('yeoman-generator'),
        chalk = require('chalk'),
        _s = require('underscore.string'),
        shelljs = require('shelljs'),
        scriptBase = require('../script-base');

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.useConfigurationFile =false;
    this.jhipsterConfigDirectory = '.jhipster';
    this.filename = this.jhipsterConfigDirectory + '/' + _s.capitalize(this.name) + '.json';
    if (shelljs.test('-f', this.filename)) {
        console.log(chalk.green('Found the ' + this.filename + ' configuration file, automatically generating the entity'));
        try {
            this.fileData = JSON.parse(this.readFileAsString(this.filename))
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

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);

function removefile(file) {
    console.log('Remove the file - ' + file)
    if (shelljs.test('-f', file)) {
        shelljs.rm(file);
    }

}

/**
 * ask if this entity serve inheritance for others
 */
EntityGenerator.prototype.askForInheritanceFor = function askForInheritanceFor() {
    if (this.useConfigurationFile == true) {// don't prompt if data are imported from a file
        return;
    }
    var cb = this.async();
    console.log(chalk.green('Generating inheritance annotations - only Single Table Strategy'));
    var choicesArr = this.inheritances.msc;
    var prompts = [
        {
            type: 'confirm',
            name: 'inheritanceForAdd',
            message: 'Would like your entity be a base class inherited by other entities?',
            default: false
        },
        {
            when: function (response) {
                return response.inheritanceForAdd == true;
            },
            type: 'confirm',
            name: 'inheritanceForClassAsk',
            message: 'Would like your entity inherite from one of MappedSuperclasses?',
            default: false
        },
        {
            when: function (response) {
                return response.inheritanceForClassAsk == true;
            },
            type: 'list',
            name: 'inheritanceForClassFrom',
            message: 'Which class would you like to extend?',
            choices: choicesArr,
            default: 0
        }
    ];
    this.prompt(prompts, function (props) {
        if (props.inheritanceForAdd) {
            this.inheritanceFor = true;
            if(props.inheritanceForClassAsk == true && props.inheritanceForClassFrom != '') {
                this.inheritanceFromClass = props.inheritanceForClassFrom;
            }
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        cb();
    }.bind(this));
}

EntityGenerator.prototype.askForInheritanceFrom = function askForInheritanceFrom() {
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
            message: 'Would like your entity to inherit from an existing entity?',
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
        cb();
    }.bind(this));
}

EntityGenerator.prototype.askForFields = function askForFields() {
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

EntityGenerator.prototype.askForRelationships = function askForRelationships() {
    if (this.useConfigurationFile == true) {// don't prompt if data are imported from a file
        return;
    }
    if (this.databaseType == 'mongodb') {
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
                if ((/^([a-zA-Z0-9_]*)$/.test(input)) && input != '') return true;
                return 'Your other entity cannot contain special characters';
            },
            message: 'What is the name of the other entity?'
        },
        {
            when: function (response) {
                return response.relationshipAdd == true;
            },
            type: 'input',
            name: 'relationshipName',
            validate: function (input) {
                if ((/^([a-zA-Z0-9_]*)$/.test(input)) && input != '' && input != 'id' && fieldNamesUnderscored.indexOf(_s.underscored(input)) == -1) return true;
                return 'Your relationship name cannot contain special characters or use an already existing field name';
            },
            message: 'What is the name of the relationship?',
            default: function (response) {
                 return response.otherEntityName;
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
                relationshipName: props.relationshipName,
                relationshipNameCapitalized: _s.capitalize(props.relationshipName),
                relationshipFieldName: props.relationshipName.charAt(0).toLowerCase() + props.relationshipName.slice(1),
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
            fieldNamesUnderscored.push(_s.underscored(props.relationshipName));
            this.relationships.push(relationship);
        }
        console.log(chalk.red('===========' + _s.capitalize(this.name) + '=============='));
        for (var id in this.fields) {
            console.log(chalk.red(this.fields[id].fieldName + ' (' + this.fields[id].fieldType + ')'));
        }
        console.log(chalk.red('-------------------'));
        for (var id in this.relationships) {
            console.log(chalk.red(this.relationships[id].relationshipName + ' - ' + this.relationships[id].otherEntityName + ' (' + this.relationships[id].relationshipType + ')'));
        }
        if (props.relationshipAdd) {
            this.askForRelationships();
        } else {
            console.log(chalk.green('Everything is configured, generating the entity...'));
            cb();
        }
    }.bind(this));

};

EntityGenerator.prototype.searchBaseTable = function searchBaseTable(entity, obj) {
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


EntityGenerator.prototype.getInheritedFields = function getInheritedFields(entity, fields, obj) {
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

EntityGenerator.prototype.fieldsTypes = function fieldsTypes() {

    var fields = this.fields;
    for(var i = 0; i < fields.length; i++) {
        if (fields[i].fieldType == 'LocalDate') {
            this.fieldsContainLocalDate = true;
            this.fieldsContainCustomTime = true;
        }
        if (fields[i].fieldType == 'BigDecimal') {
            this.fieldsContainBigDecimal = true;
        }
        if (fields[i].fieldType == 'DateTime') {
            this.fieldsContainDateTime = true;
            this.fieldsContainCustomTime = true;
        }
    }
}

EntityGenerator.prototype.files = function files() {
    if (this.databaseType == "sql") {
        this.changelogDate = this.dateFormatForLiquibase();
    }
    this.name = _s.capitalize(this.name);
    if (this.useConfigurationFile == false) { // store informations in a file for further use.
        this.data = {};
        this.data.entityType = 'entity';
        this.data.inheritanceFor = this.inheritanceFor;
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
        this.write(this.filename, JSON.stringify(this.data, null, 4));
        if(this.inheritanceFor == true || this.inheritanceFromClass != '') {
            this.inheritances.entity.push(this.name);
        }
    } else  {
        this.entityType = this.fileData.entityType;
        this.inheritanceFor = this.fileData.inheritanceFor;
        this.inheritanceFromClass = this.fileData.inheritanceFromClass;
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
        for (var idx in this.relationships) {
          var rel = this.relationships[idx];
          rel.relationshipName = rel.relationshipName || rel.otherEntityName;
          rel.relationshipNameCapitalized = rel.relationshipNameCapitalized || _s.capitalize(rel.relationshipName);
          rel.relationshipFieldName = rel.relationshipFieldName || rel.relationshipName.charAt(0).toLowerCase() + rel.relationshipName.slice(1);
        }
    }
    
    this.entityIsRootTable = false;
    if(this.inheritanceFromClass.length == 0
            || this.inheritances.msc.indexOf(this.inheritanceFromClass) != -1) {
        this.entityIsRootTable = true;
    }
    this.entityClass = _s.capitalize(this.name);
    this.entityInstance = this.name.charAt(0).toLowerCase() + this.name.slice(1);

    this.differentTypes = [this.entityClass];
    var relationshipId;
    for (relationshipId in this.relationships) {
      var entityType = this.relationships[relationshipId].otherEntityNameCapitalized;
      if (this.differentTypes.indexOf(entityType) == -1) {
        this.differentTypes.push(entityType);
      }
    }

    var insight = this.insight();
    insight.track('generator', 'entity');
    insight.track('entity/fields', this.fields.length);
    insight.track('entity/relationships', this.relationships.length);

    var resourceDir = 'src/main/resources/';
    
    this.template('src/main/java/package/domain/_Entity.java',
        'src/main/java/' + this.packageFolder + '/domain/' +    this.entityClass + '.java', this, {});

    this.template('src/main/java/package/repository/_EntityRepository.java',
        'src/main/java/' + this.packageFolder + '/repository/' +    this.entityClass + 'Repository.java', this, {});
    
    var fields = this.getInheritedFields(this.inheritanceFromClass, this.fields, this);
    if (this.databaseType == "sql") {
        if(this.entityIsRootTable == false) {
            this.baseTable = this.searchBaseTable(this.inheritanceFromClass, this);
            this.template(resourceDir + '/config/liquibase/changelog/_added_inherited_entity.xml',
                resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_inherited_entity_' + this.entityClass + '.xml', this, {});
            
            this.addChangelogToLiquibase(this.changelogDate + '_added_inherited_entity_' + this.entityClass);
        } else {
            if(this.inheritanceFromClass.length > 0) {
                this.fields = fields;
            }
            this.template(resourceDir + '/config/liquibase/changelog/_added_entity.xml',
                resourceDir + 'config/liquibase/changelog/' + this.changelogDate + '_added_entity_' + this.entityClass + '.xml', this, {});

            this.addChangelogToLiquibase(this.changelogDate + '_added_entity_' + this.entityClass);
        }
    }
    
    // after generating Liquibase we can merge fields from all inherited classes
    if(this.inheritanceFromClass.length > 0) {
        this.fields = fields;
        this.fieldsTypes();
    }
    this.template('src/main/java/package/web/rest/_EntityResource.java',
        'src/main/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'Resource.java', this, {});

    this.template('src/main/webapp/app/_entities.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + 's.html', this, {});
    
    this.template('src/main/webapp/app/_entity-detail.html',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance  + '/' + this.entityInstance + '-detail.html', this, {});

    this.addRouterToMenu(this.entityInstance);

    this.template('src/main/webapp/app/_entity.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.js', this, {});
    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.js');
    this.template('src/main/webapp/app/_entity-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '.controller' + '.js', this, {});
    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.controller' + '.js');
    
    this.template('src/main/webapp/app/_entity-detail-controller.js',
        'src/main/webapp/scripts/app/entities/' +    this.entityInstance + '/' + this.entityInstance + '-detail.controller' + '.js', this, {});
    this.addAppScriptToIndex(this.entityInstance + '/' + this.entityInstance + '-detail.controller' + '.js');

    this.template('src/main/webapp/components/_entity-service.js',
        'src/main/webapp/scripts/components/entities/' + this.entityInstance + '/' + this.entityInstance + '.service' + '.js', this, {});
    this.addComponentsScriptToIndex(this.entityInstance + '/' + this.entityInstance + '.service' + '.js');

    this.template('src/test/java/package/web/rest/_EntityResourceTest.java',
        'src/test/java/' + this.packageFolder + '/web/rest/' +    this.entityClass + 'ResourceTest.java', this, {});
    
    // Copy for each
    this.copyI18n('ca');
    this.copyI18n('da');
    this.copyI18n('de');
    this.copyI18n('en');
    this.copyI18n('es');
    this.copyI18n('fr');
    this.copyI18n('kr');
    this.copyI18n('hu');
    this.copyI18n('pl');
    this.copyI18n('pt-br');
    this.copyI18n('ru');
    this.copyI18n('sw');
    this.copyI18n('tr');
    this.copyI18n('zh-cn');
    this.copyI18n('zh-tw');
    
    removefile(this.filenameInheritance);
    this.write(this.filenameInheritance, JSON.stringify(this.inheritances, null, 4));
};

EntityGenerator.prototype.copyI18n = function(language) {
    try {
        var stats = fs.lstatSync('src/main/webapp/i18n/' + language);
        if (stats.isDirectory()) {
            this.template('src/main/webapp/i18n/_entity_' + language + '.json', 'src/main/webapp/i18n/' + language + '/' + this.entityInstance + '.json', this, {});
            this.addNewEntityToMenu(language, this.entityInstance, this.entityClass);
        }
    } catch(e) {
        // An exception is thrown if the folder doesn't exist
        // do nothing
    }
};
