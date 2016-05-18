"use strict";

const _ = require('lodash'),
    chalk = require('chalk'),
    isAValidDTO = require('../helpers/entity_helper').isAValidDTO,
    isAValidPagination = require('../helpers/entity_helper').isAValidPagination,
    isAValidService = require('../helpers/entity_helper').isAValidService,
    isAnId = require('../helpers/entity_helper').isAnId,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    ParsedData = require('../data/parsed_data');

/**
 * The parser for our DSL files.
 */
var DSLParser = module.exports = function (content, databaseTypes) {
  this.result = content;
  this.databaseTypes = databaseTypes
  this.parsedData = new ParsedData();
};

DSLParser.prototype.parse = function () {
  this.fillEnums();
  this.fillClassesAndFields();
  this.fillAssociations();
  return this.parsedData;
};

/*
 * Fills the enums
 */
DSLParser.prototype.fillEnums = function () {
  this.result.enums.forEach(function (enumObject) {
    this.addEnum(enumObject);
  }, this);
};

/**
 * Fills the associations with the extracted associations from the document.
 */
DSLParser.prototype.fillAssociations = function () {
  this.result.relationships.forEach(function (relationship) {

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

/**
 * Fills the classes and the fields that compose them.
 * @throws NullPointerException if a class' name, or an attribute, is nil.
 */
DSLParser.prototype.fillClassesAndFields = function () {
  this.result.entities.forEach(function (entity) {
    this.addClass(entity);
    entity.body.forEach(function (bodyData) {
      this.addField(bodyData, entity.name);
    }, this);
  }, this);
  addDTOOptions(this.result.dto, this.parsedData);
  addPaginationOptions(this.result.pagination, this.parsedData);
  addServiceOptions(this.result.service, this.parsedData);
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
      console.error(
          chalk.red(
              "The DTO option '" + option + "' is not supported."));
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
      console.error(
          chalk.red(
              "The pagination option '" + option + "' is not supported."));
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
      console.error(
          chalk.red(
              "The service option '" + option + "' is not supported."));
    }
  });
}

DSLParser.prototype.addEnum = function (element) {
  this.parsedData.addEnum(
      element.name, {
        name: element.name,
        values: element.values
      });
};

DSLParser.prototype.addClass = function (entity) {
  var classId = entity.name;
  if (entity.name === 'User') {
    this.parsedData.userClassId = classId;
  }
  this.parsedData.addClass(classId, {
    name: entity.name,
    comment: entity.javadoc
  });
};

DSLParser.prototype.addField = function (element, classId) {
  if (isAnId(element.name)) {
    return;
  }

  var fieldId = this.parsedData.getClass(classId).name + '_' + element.name;
  this.parsedData.addField(
      classId,
      fieldId,
      {
        name: _.lowerFirst(element.name),
        type: element.type,
        comment: element.javadoc
      });

  if (this.databaseTypes.contains(element.type)) {
    this.parsedData.addType(element.type, {name: element.type});
    this.addConstraint(element.validations, fieldId, element.type);
  } else if (this.parsedData.getEnum(element.type) !== -1) {
    this.addConstraint(element.validations, fieldId, 'Enum');
  } else {
    throw new buildException(
        exceptions.WrongType,
        `The type '${element.type}' isn't supported by JHipster or declared as an Enum.`);
  }
};

DSLParser.prototype.addConstraint = function (constraintList, fieldId, type) {
  constraintList.forEach(function (element) {
    var validationName = element.key;

    if (!this.databaseTypes.isValidationSupportedForType(
            type,
            validationName)) {
      throw new buildException(
          exceptions.WrongValidation,
          `The validation '${validationName}' isn't supported for the type '${type}'.`);
    }
    this.parsedData.addValidationToField(
        fieldId,
        fieldId + "_" + element.key,
        {name: element.key, value: element.value});
  }, this);
};

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
