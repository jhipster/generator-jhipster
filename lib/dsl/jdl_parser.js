'use strict';

const _ = require('lodash'),
    JDLObject = require('../core/jdl_object'),
    JDLField = require('../core/jdl_field'),
    JDLValidation = require('../core/jdl_validation'),
    FieldTypes = require('../core/jhipster/field_types'),
    AbstractParser = require('../editors/abstract_parser'),
    parser_helper = require('../editors/parser_helper'),
    isAValidDTO = require('../helpers/jhipster_option_helper').isAValidDTO,
    isAValidPagination = require('../helpers/jhipster_option_helper').isAValidPagination,
    isAValidService = require('../helpers/jhipster_option_helper').isAValidService,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;


let document;
let jdlObject = new JDLObject();
let isType;

function parse(passedDocument, passedDatabaseType) {
  if (!passedDocument || !passedDatabaseType) {
    throw new buildException(exceptions.NullPointer, 'The parsed JDL content and the database type must be passed.');
  }
  init(passedDocument, passedDatabaseType);
  fillEnums();
  fillClassesAndFields();
  fillAssociations();
  return jdlObject;
}

function init(passedDocument, passedDatabaseType) {
  if (document) {
    resetState();
  }
  document = passedDocument;
  jdlObject = new JDLObject();
  switch (passedDatabaseType) {
    case 'sql':
      isType = FieldTypes.isSQLType;
      break;
    case 'mongodb':
      isType = FieldTypes.isMongoDBType;
      break;
    case 'cassandra':
      isType = FieldTypes.isCassandraType;
      break;
    default:
      throw new buildException(
          exceptions.IllegalArgument,
          "The passed database type must either be 'sql', 'mongodb', or 'cassandra'");
  }
}

function fillEnums() {
  for (let i = 0; i < document.enums.length; i++) {
    jdlObject.addEnum({
      name: document.enums[i].name,
      values: document.enums[i].values
    });
  }
}

function fillClassesAndFields() {
  for (let i = 0; i < document.entities.length; i++) {
    jdlObject.addEntity({
      name: document.entities[i].name,
      tableName: document.entities[i].tableName,
      fields: getFields(document.entities[i]),
      comment: document.entities[i].javadoc
    });
  }
}

function getFields(entity) {
  var fields = {};
  for (let i = 0; i < entity.body.length; i++) {
    let field = entity.body[i];
    if (field.name.toLowerCase() === 'id') {
      continue;
    }
    if (jdlObject.enums[field.type] || isType(jdlObject.enums[field.type])) {
      let fieldName = _.lowerFirst(field.name);
      fields[fieldName] = new JDLField({
        name: fieldName,
        type: field.type,
        comment: field.javadoc,
        validations: getValidations(field)
      });
    } else {
      throw new buildException(exceptions.WrongType, `The type '${field.type}' doesn't exist.`);
    }
  }
  return fields;
}

function getValidations(field) {
  var validations = {};
  for (let i = 0; i < field.validations.length; i++) {
    if (!FieldTypes.hasValidation(field.type, field.validations[i].name)) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${field.validations[i]}' isn't supported for the type '${field.type}'.`);
    }
    validations[field.validations[i].name] = new JDLValidation({
      name: field.validations[i].name,
      value: field.validations[i].value
    });
  }
  return validations;
}

DSLParser.prototype.fillClassesAndFields = function () {
  addDTOOptions(this.result.dto, this.parsedData);
  addPaginationOptions(this.result.pagination, this.parsedData);
  addServiceOptions(this.result.service, this.parsedData);
};

function resetState() {
  document = null;
  isType = null;
  jdlObject = null;
}

DSLParser.prototype.fillAssociations = function () {
  this.result.relationships.forEach(function (relationshipObject) {
    var relationship = relationshipObject;

    var associationId = relationship.from.name
        + '_'
        + relationship.from.injectedfield
        + '_to_'
        + relationship.to.name
        + '_'
        + relationship.to.injectedfield;
    this.checkEntityDeclaration(relationship);

    var associationData = {
      from: _.upperFirst(relationship.from.name),
      to: _.upperFirst(relationship.to.name),
      type: relationship.cardinality,
      injectedFieldInFrom: relationship.from.injectedfield,
      injectedFieldInTo: relationship.to.injectedfield,
      commentInFrom: relationship.from.javadoc,
      commentInTo: relationship.to.javadoc
    };

    this.parsedData.addAssociation(associationId, associationData);
  }, this);
};


function addDTOOptions(dtos, parsedData) {
  Object.keys(dtos).forEach(function (option) {
    if (isAValidDTO(option)) {
      var collection = (dtos[option].list[0] === '*')
          ? Object.keys(parsedData.classes)
          : dtos[option].list;
      if (dtos[option].excluded.length !== 0) {
        collection = collection.filter(function (className) {
          return dtos[option].excluded.indexOf(className) === -1;
        });
      }
      collection.forEach(function (className) {
        parsedData.getClass(className).dto = option;
      });
    } else {
      console.error("The DTO option '" + option + "' is not supported.");
    }
  });
}

function addPaginationOptions(paginations, parsedData) {
  Object.keys(paginations).forEach(function (option) {
    if (isAValidPagination(option)) {
      var collection = (paginations[option].list[0] === '*')
          ? Object.keys(parsedData.classes)
          : paginations[option].list;
      if (paginations[option].excluded.length !== 0) {
        collection = collection.filter(function (className) {
          return paginations[option].excluded.indexOf(className) === -1;
        });
      }
      collection.forEach(function (className) {
        parsedData.getClass(className).pagination = option;
      });
    } else {
      console.error("The pagination option '" + option + "' is not supported.");
    }
  });
}

function addServiceOptions(services, parsedData) {
  Object.keys(services).forEach(function (option) {
    if (isAValidService(option)) {
      var collection = (services[option].list[0] === '*')
          ? Object.keys(parsedData.classes)
          : services[option].list;
      if (services[option].excluded.length !== 0) {
        collection = collection.filter(function (className) {
          return services[option].excluded.indexOf(className) === -1;
        });
      }
      collection.forEach(function (className) {
        parsedData.getClass(className).service = option;
      });
    } else {
      console.error("The service option '" + option + "' is not supported.");
    }
  });
}

/*
 * Checks if all the entities stated in the relationship are
 * declared, and create a class User if the entity User is declared implicitly.
 * @param {Object} relationship the relationship to check.
 */
DSLParser.prototype.checkEntityDeclaration = function (association) {
  if (!this.parsedData.getClass('User')
      && (association.from.name === 'User' || association.to.name === 'User')) {
    this.parsedData.userClassId = 'User';
    this.parsedData.addClass('User', {name: 'User'});
  }

  var absentEntities = [];

  if (!this.parsedData.getClass(association.from.name)) {
    absentEntities.push(association.from.name);
  }
  if (!this.parsedData.getClass(association.to.name)) {
    absentEntities.push(association.to.name);
  }
  if (absentEntities.length !== 0) {
    throw new buildException(
        exceptions.UndeclaredEntity,
        `In the relationship between ${association.from.name} and `
        + `${association.to.name}, ${absentEntities.join(' and ')} `
        + `${(absentEntities.length === 1 ? 'is' : 'are')} not declared.`
    );
  }
};
