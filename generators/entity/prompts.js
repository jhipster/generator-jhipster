'use strict';

var chalk = require('chalk'),
    path = require('path'),
    _ = require('lodash'),
    jhiCore = require('jhipster-core'),
    shelljs = require('shelljs');

module.exports = {
    askForMicroserviceJson,
    askForUpdate,
    askForFields,
    askForFieldsToRemove,
    askForRelationships,
    askForRelationsToRemove,
    askForTableName,
    askForDTO,
    askForService,
    askForPagination
};

function askForMicroserviceJson() {
    if (this.applicationType !== 'gateway' || this.useConfigurationFile) {
        return;
    }

    var done = this.async();

    var prompts = [
        {
            type: 'confirm',
            name: 'useMicroserviceJson',
            message: 'Do you want to generate this entity from an existing microservice?',
            default: true
        },
        {
            when: function(response) {
                return response.useMicroserviceJson === true;
            },
            type: 'input',
            name: 'microservicePath',
            message: 'Enter the path to the microservice root directory:',
            store: true,
            validate: function(input) {
                var fromPath = '';
                if(path.isAbsolute(input)) {
                    fromPath = input + '/' + this.filename;
                } else {
                    fromPath = this.destinationPath(input + '/' + this.filename);
                }

                if (shelljs.test('-f', fromPath)) {
                    return true;
                } else {
                    return this.filename + ' not found in ' + input + '/';
                }
            }.bind(this)
        }
    ];

    this.prompt(prompts).then(function(props) {
        if (props.useMicroserviceJson) {
            this.log(chalk.green('\nFound the ' + this.filename + ' configuration file, entity can be automatically generated!\n'));
            if(path.isAbsolute(props.microservicePath)) {
                this.microservicePath = props.microservicePath;
            } else {
                this.microservicePath = path.resolve(props.microservicePath);
            }
            this.fromPath = this.microservicePath + '/' + this.jhipsterConfigDirectory + '/' + this.entityNameCapitalized + '.json';
            this.useConfigurationFile = true;
            this.useMicroserviceJson = true;
            this._loadJson();
        }
        done();
    }.bind(this));
}

function askForUpdate() {
    // ask only if running an existing entity without arg option --force or --regenerate
    var isForce = this.options['force'] || this.regenerate;
    this.updateEntity = 'regenerate'; // default if skipping questions by --force
    if (isForce || !this.useConfigurationFile) {
        return;
    }
    var done = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'updateEntity',
            message: 'Do you want to update the entity? This will replace the existing files for this entity, all your custom code will be overwritten',
            choices: [
                {
                    value: 'regenerate',
                    name: 'Yes, re generate the entity'
                },
                {
                    value: 'add',
                    name: '[BETA] Yes, add more fields and relationships'
                },
                {
                    value: 'remove',
                    name: '[BETA] Yes, remove fields and relationships'
                },
                {
                    value: 'none',
                    name: 'No, exit'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts).then(function (props) {
        this.updateEntity = props.updateEntity;
        if (this.updateEntity === 'none') {
            this.env.error(chalk.green('Aborting entity update, no changes were made.'));
        }
        done();

    }.bind(this));
}

function askForFields() {
    // don't prompt if data is imported from a file
    if (this.useConfigurationFile && this.updateEntity !== 'add') {
        return;
    }

    if (this.updateEntity === 'add') {
        logFieldsAndRelationships.call(this);
    }

    var done = this.async();

    askForField.call(this, done);
}

function askForFieldsToRemove() {
    // prompt only if data is imported from a file
    if (!this.useConfigurationFile || this.updateEntity !== 'remove') {
        return;
    }
    var done = this.async();

    var prompts = [
        {
            type: 'checkbox',
            name: 'fieldsToRemove',
            message: 'Please choose the fields you want to remove',
            choices: this.fieldNameChoices,
            default: 'none'
        },
        {
            when: function (response) {
                return response.fieldsToRemove !== 'none';
            },
            type: 'confirm',
            name: 'confirmRemove',
            message: 'Are you sure to remove these fields?',
            default: true
        }
    ];
    this.prompt(prompts).then(function (props) {
        if (props.confirmRemove) {
            this.log(chalk.red('\nRemoving fields: ' + props.fieldsToRemove + '\n'));
            var i;
            for (i = this.fields.length - 1; i >= 0; i -= 1) {
                var field = this.fields[i];
                if (props.fieldsToRemove.filter(function (val) {
                    return val === field.fieldName;
                }).length > 0) {
                    this.fields.splice(i, 1);
                }
            }
        }
        done();

    }.bind(this));
}

function askForRelationships() {
    // don't prompt if data is imported from a file
    if (this.useConfigurationFile && this.updateEntity !== 'add') {
        return;
    }
    if (this.databaseType === 'mongodb' || this.databaseType === 'cassandra') {
        return;
    }

    var done = this.async();

    askForRelationship.call(this, done);
}

function askForRelationsToRemove() {
    // prompt only if data is imported from a file
    if (!this.useConfigurationFile || this.updateEntity !== 'remove') {
        return;
    }
    if (this.databaseType === 'mongodb' || this.databaseType === 'cassandra') {
        return;
    }

    var done = this.async();

    var prompts = [
        {
            type: 'checkbox',
            name: 'relsToRemove',
            message: 'Please choose the relationships you want to remove',
            choices: this.relNameChoices,
            default: 'none'
        },
        {
            when: function (response) {
                return response.relsToRemove !== 'none';
            },
            type: 'confirm',
            name: 'confirmRemove',
            message: 'Are you sure to remove these relationships?',
            default: true
        }
    ];
    this.prompt(prompts).then(function (props) {
        if (props.confirmRemove) {
            this.log(chalk.red('\nRemoving relationships: ' + props.relsToRemove + '\n'));
            var i;
            for (i = this.relationships.length - 1; i >= 0; i -= 1) {
                var rel = this.relationships[i];
                if (props.relsToRemove.filter(function (val) {
                    return val === rel.relationshipName + ':' + rel.relationshipType;
                }).length > 0) {
                    this.relationships.splice(i, 1);
                }
            }
        }
        done();

    }.bind(this));
}

function askForTableName() {
    // don't prompt if there are no relationships
    var entityTableName = this.entityTableName;
    var prodDatabaseType = this.prodDatabaseType;
    if (!this.relationships || this.relationships.length === 0 || !((prodDatabaseType === 'oracle' && entityTableName.length > 14) || entityTableName.length > 30)) {
        return;
    }
    var done = this.async();
    var prompts = [
        {
            type: 'input',
            name: 'entityTableName',
            message: 'The table name for this entity is too long to form constraint names. Please use a shorter table name',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'The table name cannot contain special characters';
                } else if (input === '') {
                    return 'The table name cannot be empty';
                } else if (jhiCore.isReservedTableName(input, prodDatabaseType)) {
                    return `The table name cannot contain a ${prodDatabaseType.toUpperCase()} reserved keyword`;
                } else if (prodDatabaseType === 'oracle' && input.length > 14) {
                    return 'The table name is too long for Oracle, try a shorter name';
                } else if (input.length > 30) {
                    return 'The table name is too long, try a shorter name';
                }
                return true;
            },
            default: entityTableName
        }
    ];
    this.prompt(prompts).then(function (props) {
        /* overwrite the table name for the entity using name obtained from the user*/
        if (props.entityTableName !== this.entityTableName) {
            this.entityTableName = _.snakeCase(props.entityTableName).toLowerCase();
        }
        done();
    }.bind(this));
}

function askForDTO() {
    // don't prompt if data is imported from a file
    if (this.useConfigurationFile) {
        return;
    }
    var done = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'dto',
            message: 'Do you want to use a Data Transfer Object (DTO)?',
            choices: [
                {
                    value: 'no',
                    name: 'No, use the entity directly'
                },
                {
                    value: 'mapstruct',
                    name: '[BETA] Yes, generate a DTO with MapStruct'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts).then(function (props) {
        this.dto = props.dto;
        done();
    }.bind(this));
}

function askForService() {
    // don't prompt if data are imported from a file
    if (this.useConfigurationFile) {
        return;
    }
    var done = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'service',
            message: 'Do you want to use separate service class for your business logic?',
            choices: [
                {
                    value: 'no',
                    name: 'No, the REST controller should use the repository directly'
                },
                {
                    value: 'serviceClass',
                    name: 'Yes, generate a separate service class'
                },
                {
                    value: 'serviceImpl',
                    name: 'Yes, generate a separate service interface and implementation'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts).then(function (props) {
        this.service = props.service;
        done();
    }.bind(this));
}

function askForPagination() {
    // don't prompt if data are imported from a file
    if (this.useConfigurationFile) {
        return;
    }
    if (this.databaseType === 'cassandra') {
        return;
    }
    var done = this.async();
    var prompts = [
        {
            type: 'list',
            name: 'pagination',
            message: 'Do you want pagination on your entity?',
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'pager',
                    name: 'Yes, with a simple pager'
                },
                {
                    value: 'pagination',
                    name: 'Yes, with pagination links'
                },
                {
                    value: 'infinite-scroll',
                    name: 'Yes, with infinite scroll'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts).then(function (props) {
        this.pagination = props.pagination;
        this.log(chalk.green('\nEverything is configured, generating the entity...\n'));
        done();
    }.bind(this));
}

/**
 * ask question for a field creation
 */
function askForField(done) {
    this.log(chalk.green('\nGenerating field #' + (this.fields.length + 1) + '\n'));
    var prodDatabaseType = this.prodDatabaseType;
    var databaseType = this.databaseType;
    var fieldNamesUnderscored = this.fieldNamesUnderscored;
    var prompts = [
        {
            type: 'confirm',
            name: 'fieldAdd',
            message: 'Do you want to add a field to your entity?',
            default: true
        },
        {
            when: function (response) {
                return response.fieldAdd === true;
            },
            type: 'input',
            name: 'fieldName',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your field name cannot contain special characters';
                } else if (input === '') {
                    return 'Your field name cannot be empty';
                } else if (input.charAt(0) === input.charAt(0).toUpperCase()) {
                    return 'Your field name cannot start with a upper case letter';
                } else if (input === 'id' || fieldNamesUnderscored.indexOf(_.snakeCase(input)) !== -1) {
                    return 'Your field name cannot use an already existing field name';
                } else if (jhiCore.isReservedFieldName(input, prodDatabaseType)) {
                    return `Your field name cannot contain a Java or ${ prodDatabaseType.toUpperCase() } reserved keyword`;
                } else if (prodDatabaseType === 'oracle' && input.length > 30) {
                    return 'The field name cannot be of more than 30 characters';
                }
                return true;
            },
            message: 'What is the name of your field?'
        },
        {
            when: function (response) {
                return response.fieldAdd === true && (databaseType === 'sql' || databaseType === 'mongodb');
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
                    value: 'Float',
                    name: 'Float'
                },
                {
                    value: 'Double',
                    name: 'Double'
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
                    value: 'ZonedDateTime',
                    name: 'ZonedDateTime'
                },
                {
                    value: 'Boolean',
                    name: 'Boolean'
                },
                {
                    value: 'enum',
                    name: 'Enumeration (Java enum type)'
                },
                {
                    value: 'byte[]',
                    name: '[BETA] Blob'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                if (response.fieldType === 'enum') {
                    response.fieldIsEnum = true;
                    return true;
                } else {
                    response.fieldIsEnum = false;
                    return false;
                }
            },
            type: 'input',
            name: 'fieldType',
            validate: function (input) {
                if (input === '') {
                    return 'Your class name cannot be empty.';
                } else if (jhiCore.isReservedKeyword(input, 'JAVA')) {
                    return 'Your enum name cannot contain a Java reserved keyword';
                }
                if (this.enums.indexOf(input) !== -1) {
                    this.existingEnum = true;
                } else {
                    this.enums.push(input);
                }
                return true;
            }.bind(this),
            message: 'What is the class name of your enumeration?'
        },
        {
            when: function (response) {
                return response.fieldIsEnum;
            },
            type: 'input',
            name: 'fieldValues',
            validate: function (input) {
                if (input === '' && this.existingEnum) {
                    this.existingEnum = false;
                    return true;
                }
                if (input === '') {
                    return 'You must specify values for your enumeration';
                }
                if (!/^[A-Za-z0-9_,\s]*$/.test(input)) {
                    return 'Enum values cannot contain special characters (allowed characters: A-Z, a-z, 0-9 and _)';
                }
                var enums = input.replace(/\s/g, '').split(',');
                if (_.uniq(enums).length !== enums.length) {
                    return 'Enum values cannot contain duplicates (typed values: ' + input + ')';
                }
                for (var i = 0; i < enums.length; i++) {
                    if (/^[0-9].*/.test(enums[i])) {
                        return 'Enum value "' + enums[i] + '" cannot start with a number';
                    }
                    if (enums[i] === '') {
                        return 'Enum value cannot be empty (did you accidently type "," twice in a row?)';
                    }
                }

                return true;
            }.bind(this),
            message: function (answers) {
                if (!this.existingEnum) {
                    return 'What are the values of your enumeration (separated by comma)?';
                }
                return 'What are the new values of your enumeration (separated by comma)?\nThe new values will replace the old ones.\nNothing will be done if there are no new values.';
            }.bind(this)
        },
        {
            when: function (response) {
                return response.fieldAdd === true && databaseType === 'cassandra';
            },
            type: 'list',
            name: 'fieldType',
            message: 'What is the type of your field?',
            choices: [
                {
                    value: 'UUID',
                    name: 'UUID'
                },
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
                    value: 'Float',
                    name: 'Float'
                },
                {
                    value: 'Double',
                    name: 'Double'
                },
                {
                    value: 'BigDecimal',
                    name: 'BigDecimal'
                },
                {
                    value: 'LocalDate',
                    name: 'LocalDate (Warning: only compatible with cassandra v3)'
                },
                {
                    value: 'ZonedDateTime',
                    name: 'ZonedDateTime'
                },
                {
                    value: 'Boolean',
                    name: 'Boolean'
                },
                {
                    value: 'ByteBuffer',
                    name: '[BETA] blob'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldType === 'byte[]';
            },
            type: 'list',
            name: 'fieldTypeBlobContent',
            message: 'What is the content of the Blob field?',
            choices: [
                {
                    value: 'image',
                    name: 'An image'
                },
                {
                    value: 'any',
                    name: 'A binary file'
                },
                {
                    value: 'text',
                    name: 'A CLOB (Text field)'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldType === 'ByteBuffer';
            },
            type: 'list',
            name: 'fieldTypeBlobContent',
            message: 'What is the content of the Blob field?',
            choices: [
                {
                    value: 'image',
                    name: 'An image'
                },
                {
                    value: 'any',
                    name: 'A binary file'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true;
            },
            type: 'confirm',
            name: 'fieldValidate',
            message: 'Do you want to add validation rules to your field?',
            default: false
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldType === 'String';
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {
                    name: 'Required',
                    value: 'required'
                },
                {
                    name: 'Minimum length',
                    value: 'minlength'
                },
                {
                    name: 'Maximum length',
                    value: 'maxlength'
                },
                {
                    name: 'Regular expression pattern',
                    value: 'pattern'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    (response.fieldType === 'Integer' ||
                    response.fieldType === 'Long' ||
                    response.fieldType === 'Float' ||
                    response.fieldType === 'Double' ||
                    response.fieldType === 'BigDecimal' ||
                    response.fieldTypeBlobContent === 'text');
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {
                    name: 'Required',
                    value: 'required'
                },
                {
                    name: 'Minimum',
                    value: 'min'
                },
                {
                    name: 'Maximum',
                    value: 'max'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldType === 'byte[]' &&
                    response.fieldTypeBlobContent !== 'text';
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {
                    name: 'Required',
                    value: 'required'
                },
                {
                    name: 'Minimum byte size',
                    value: 'minbytes'
                },
                {
                    name: 'Maximum byte size',
                    value: 'maxbytes'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    (response.fieldType === 'LocalDate' ||
                    response.fieldType === 'ZonedDateTime' ||
                    response.fieldType === 'UUID' ||
                    response.fieldType === 'Boolean' ||
                    response.fieldType === 'ByteBuffer' ||
                    response.fieldIsEnum === true);
            },
            type: 'checkbox',
            name: 'fieldValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {
                    name: 'Required',
                    value: 'required'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('minlength') !== -1;
            },
            type: 'input',
            name: 'fieldValidateRulesMinlength',
            validate: function (input) {
                if (this.isNumber(input)) return true;
                return 'Minimum length must be a positive number';
            }.bind(this),
            message: 'What is the minimum length of your field?',
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('maxlength') !== -1;
            },
            type: 'input',
            name: 'fieldValidateRulesMaxlength',
            validate: function (input) {
                if (this.isNumber(input)) return true;
                return 'Maximum length must be a positive number';
            }.bind(this),
            message: 'What is the maximum length of your field?',
            default: 20
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('min') !== -1 &&
                    (response.fieldType === 'Integer' ||
                    response.fieldType === 'Long' ||
                    response.fieldTypeBlobContent === 'text');
            },
            type: 'input',
            name: 'fieldValidateRulesMin',
            message: 'What is the minimum of your field?',
            validate: function (input) {
                if (this.isSignedNumber(input)) return true;
                return 'Minimum must be a number';
            }.bind(this),
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('max') !== -1 &&
                    (response.fieldType === 'Integer' ||
                    response.fieldType === 'Long' ||
                    response.fieldTypeBlobContent === 'text');
            },
            type: 'input',
            name: 'fieldValidateRulesMax',
            message: 'What is the maximum of your field?',
            validate: function (input) {
                if (this.isSignedNumber(input)) return true;
                return 'Maximum must be a number';
            }.bind(this),
            default: 100
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('min') !== -1 &&
                    (response.fieldType === 'Float' ||
                    response.fieldType === 'Double' ||
                    response.fieldType === 'BigDecimal');
            },
            type: 'input',
            name: 'fieldValidateRulesMin',
            message: 'What is the minimum of your field?',
            validate: function (input) {
                if (this.isSignedDecimalNumber(input, true)) return true;
                return 'Minimum must be a decimal number';
            }.bind(this),
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('max') !== -1 &&
                    (response.fieldType === 'Float' ||
                    response.fieldType === 'Double' ||
                    response.fieldType === 'BigDecimal');
            },
            type: 'input',
            name: 'fieldValidateRulesMax',
            message: 'What is the maximum of your field?',
            validate: function (input) {
                if (this.isSignedDecimalNumber(input, true)) return true;
                return 'Maximum must be a decimal number';
            }.bind(this),
            default: 100
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('minbytes') !== -1 &&
                    response.fieldType === 'byte[]' &&
                    response.fieldTypeBlobContent !== 'text';
            },
            type: 'input',
            name: 'fieldValidateRulesMinbytes',
            message: 'What is the minimum byte size of your field?',
            validate: function (input) {
                if (this.isNumber(input)) return true;
                return 'Minimum byte size must be a positive number';
            }.bind(this),
            default: 0
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('maxbytes') !== -1 &&
                    response.fieldType === 'byte[]' &&
                    response.fieldTypeBlobContent !== 'text';
            },
            type: 'input',
            name: 'fieldValidateRulesMaxbytes',
            message: 'What is the maximum byte size of your field?',
            validate: function (input) {
                if (this.isNumber(input)) return true;
                return 'Maximum byte size must be a positive number';
            }.bind(this),
            default: 5000000
        },
        {
            when: function (response) {
                return response.fieldAdd === true &&
                    response.fieldValidate === true &&
                    response.fieldValidateRules.indexOf('pattern') !== -1;
            },
            type: 'input',
            name: 'fieldValidateRulesPattern',
            message: 'What is the regular expression pattern you want to apply on your field?',
            default: '^[a-zA-Z0-9]*$'
        }
    ];
    this.prompt(prompts).then(function (props) {
        if (props.fieldAdd) {
            if (props.fieldIsEnum) {
                props.fieldType = _.upperFirst(props.fieldType);
            }

            var field = {
                fieldName: props.fieldName,
                fieldType: props.fieldType,
                fieldTypeBlobContent: props.fieldTypeBlobContent,
                fieldValues: props.fieldValues,
                fieldValidateRules: props.fieldValidateRules,
                fieldValidateRulesMinlength: props.fieldValidateRulesMinlength,
                fieldValidateRulesMaxlength: props.fieldValidateRulesMaxlength,
                fieldValidateRulesPattern: props.fieldValidateRulesPattern,
                fieldValidateRulesMin: props.fieldValidateRulesMin,
                fieldValidateRulesMax: props.fieldValidateRulesMax,
                fieldValidateRulesMinbytes: props.fieldValidateRulesMinbytes,
                fieldValidateRulesMaxbytes: props.fieldValidateRulesMaxbytes
            };

            fieldNamesUnderscored.push(_.snakeCase(props.fieldName));
            this.fields.push(field);
        }
        logFieldsAndRelationships.call(this);
        if (props.fieldAdd) {
            askForField.call(this, done);
        } else {
            done();
        }
    }.bind(this));
}

/**
 * ask question for a relationship creation
 */
function askForRelationship(done) {
    var name = this.name;
    this.log(chalk.green('\nGenerating relationships to other entities\n'));
    var fieldNamesUnderscored = this.fieldNamesUnderscored;
    var prompts = [
        {
            type: 'confirm',
            name: 'relationshipAdd',
            message: 'Do you want to add a relationship to another entity?',
            default: true
        },
        {
            when: function (response) {
                return response.relationshipAdd === true;
            },
            type: 'input',
            name: 'otherEntityName',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your other entity name cannot contain special characters';
                } else if (input === '') {
                    return 'Your other entity name cannot be empty';
                } else if (jhiCore.isReservedKeyword(input, 'JAVA')) {
                    return 'Your other entity name cannot contain a Java reserved keyword';
                }
                return true;
            },
            message: 'What is the name of the other entity?'
        },
        {
            when: function (response) {
                return response.relationshipAdd === true;
            },
            type: 'input',
            name: 'relationshipName',
            validate: function (input) {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your relationship cannot contain special characters';
                } else if (input === '') {
                    return 'Your relationship cannot be empty';
                } else if (input === 'id' || fieldNamesUnderscored.indexOf(_.snakeCase(input)) !== -1) {
                    return 'Your relationship cannot use an already existing field name';
                } else if (jhiCore.isReservedKeyword(input, 'JAVA')) {
                    return 'Your relationship cannot contain a Java reserved keyword';
                }
                return true;
            },
            message: 'What is the name of the relationship?',
            default: function (response) {
                return _.lowerFirst(response.otherEntityName);
            }
        },
        {
            when: function (response) {
                return response.relationshipAdd === true && response.otherEntityName.toLowerCase() !== 'user';
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
            when: function (response) {
                return response.relationshipAdd === true && response.otherEntityName.toLowerCase() === 'user';
            },
            type: 'list',
            name: 'relationshipType',
            message: 'What is the type of the relationship?',
            choices: [
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
            when: function (response) {
                return (response.relationshipAdd === true && response.otherEntityName.toLowerCase() !== 'user' && (response.relationshipType === 'many-to-many' || response.relationshipType === 'one-to-one'));
            },
            type: 'confirm',
            name: 'ownerSide',
            message: 'Is this entity the owner of the relationship?',
            default: false
        },
        {
            when: function (response) {
                return (response.relationshipAdd === true && (response.relationshipType === 'one-to-many' ||
                ((response.relationshipType === 'many-to-many' ||
                response.relationshipType === 'one-to-one') && response.otherEntityName.toLowerCase() !== 'user')));
            },
            type: 'input',
            name: 'otherEntityRelationshipName',
            message: 'What is the name of this relationship in the other entity?',
            default: function (response) {
                return _.lowerFirst(name);
            }
        },
        {
            when: function (response) {
                return (response.relationshipAdd === true && (response.relationshipType === 'many-to-one' || (response.relationshipType === 'many-to-many' && response.ownerSide === true) || (response.relationshipType === 'one-to-one' && response.ownerSide === true)));
            },
            type: 'input',
            name: 'otherEntityField',
            message: function (response) {
                return 'When you display this relationship with AngularJS, which field from \'' + response.otherEntityName + '\' do you want to use?';
            },
            default: 'id'
        },
        {
            when: function (response) {
                return (response.relationshipAdd === true && (response.relationshipType === 'many-to-one' || (response.relationshipType === 'many-to-many' && response.ownerSide === true) || (response.relationshipType === 'one-to-one' && response.ownerSide === true)));
            },
            type: 'confirm',
            name: 'relationshipValidate',
            message: 'Do you want to add any validation rules to this relationship?',
            default: false
        },
        {
            when: function (response) {
                return (response.relationshipValidate === true);
            },
            type: 'checkbox',
            name: 'relationshipValidateRules',
            message: 'Which validation rules do you want to add?',
            choices: [
                {
                    name: 'Required',
                    value: 'required'
                }
            ],
            default: 0
        }
    ];
    this.prompt(prompts).then(function (props) {

        if (props.relationshipAdd) {
            var relationship = {
                relationshipName: props.relationshipName,
                otherEntityName: _.lowerFirst(props.otherEntityName),
                relationshipType: props.relationshipType,
                relationshipValidateRules: props.relationshipValidateRules,
                otherEntityField: props.otherEntityField,
                ownerSide: props.ownerSide,
                otherEntityRelationshipName: props.otherEntityRelationshipName
            };

            if(props.otherEntityName.toLowerCase() === 'user') {
                relationship.ownerSide = true;
            }

            fieldNamesUnderscored.push(_.snakeCase(props.relationshipName));
            this.relationships.push(relationship);
        }
        logFieldsAndRelationships.call(this);
        if (props.relationshipAdd) {
            askForRelationship.call(this, done);
        } else {
            this.log('\n');
            done();
        }
    }.bind(this));
}

/**
 * Show the entity and it's fields and relationships in console
 */
function logFieldsAndRelationships() {
    if (this.fields.length > 0 || this.relationships.length > 0) {
        this.log(chalk.red(chalk.white('\n================= ') + this.entityNameCapitalized + chalk.white(' =================')));
    }
    if (this.fields.length > 0) {
        this.log(chalk.white('Fields'));
        this.fields.forEach(function (field) {
            var validationDetails = '';
            var fieldValidate = _.isArray(field.fieldValidateRules) && field.fieldValidateRules.length >= 1;
            if (fieldValidate === true) {
                if (field.fieldValidateRules.indexOf('required') !== -1) {
                    validationDetails = 'required ';
                }
                if (field.fieldValidateRules.indexOf('minlength') !== -1) {
                    validationDetails += 'minlength=\'' + field.fieldValidateRulesMinlength + '\' ';
                }
                if (field.fieldValidateRules.indexOf('maxlength') !== -1) {
                    validationDetails += 'maxlength=\'' + field.fieldValidateRulesMaxlength + '\' ';
                }
                if (field.fieldValidateRules.indexOf('pattern') !== -1) {
                    validationDetails += 'pattern=\'' + field.fieldValidateRulesPattern + '\' ';
                }
                if (field.fieldValidateRules.indexOf('min') !== -1) {
                    validationDetails += 'min=\'' + field.fieldValidateRulesMin + '\' ';
                }
                if (field.fieldValidateRules.indexOf('max') !== -1) {
                    validationDetails += 'max=\'' + field.fieldValidateRulesMax + '\' ';
                }
                if (field.fieldValidateRules.indexOf('minbytes') !== -1) {
                    validationDetails += 'minbytes=\'' + field.fieldValidateRulesMinbytes + '\' ';
                }
                if (field.fieldValidateRules.indexOf('maxbytes') !== -1) {
                    validationDetails += 'maxbytes=\'' + field.fieldValidateRulesMaxbytes + '\' ';
                }
            }
            this.log(chalk.red(field.fieldName) + chalk.white(' (' + field.fieldType + (field.fieldTypeBlobContent ? ' ' + field.fieldTypeBlobContent : '') + ') ') + chalk.cyan(validationDetails));
        }, this);
        this.log();
    }
    if (this.relationships.length > 0) {
        this.log(chalk.white('Relationships'));
        this.relationships.forEach(function (relationship) {
            var validationDetails = '';
            if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.indexOf('required') !== -1) {
                validationDetails = 'required ';
            }
            this.log(chalk.red(relationship.relationshipName) + ' ' + chalk.white('(' + _.upperFirst(relationship.otherEntityName) + ')') + ' ' + chalk.cyan(relationship.relationshipType)+' ' + chalk.cyan(validationDetails));
        }, this);
        this.log();
    }
}
