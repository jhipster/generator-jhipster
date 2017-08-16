

const _ = require('lodash');
const JDLObject = require('../core/jdl_object');
const JDLEntity = require('../core/jdl_entity');
const JDLField = require('../core/jdl_field');
const JDLValidation = require('../core/jdl_validation');
const JDLEnum = require('../core/jdl_enum');
const JDLRelationship = require('../core/jdl_relationship');
const JDLUnaryOption = require('../core/jdl_unary_option');
const JDLBinaryOption = require('../core/jdl_binary_option');
const RelationshipTypes = require('../core/jhipster/relationship_types').RELATIONSHIP_TYPES;
const UnaryOptions = require('../core/jhipster/unary_options').UNARY_OPTIONS;
const BinaryOptions = require('../core/jhipster/binary_options').BINARY_OPTIONS;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  parseEntities,
  parseServerOptions
};

const USER = 'User';
const USER_ENTITY = new JDLEntity({ name: USER });

/*
 * Parses the json entities into JDL
 * entities: json map with entity name as key and entity definition as value
 * jdl: JDLObject to which the parsed entities are added. If undefined a new JDLObject is created.
 * returns the JDLObject
 */
function parseEntities(entities, jdl) {
  if (!entities) {
    throw new BuildException(exceptions.NullPointer, 'Entities have to be passed to be converted.');
  }
  if (!jdl) {
    jdl = new JDLObject();
  }
  const skipUserManagement = hasSkipUserManagement(jdl);
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    const entityName = entityNames[i];
    if (entityName === USER && !skipUserManagement) {
      throw new BuildException(
        exceptions.IllegalName,
        'User entity name is reserved if skipUserManagement is not set.');
    }
    const entity = entities[entityName];
    jdl.addEntity(jsonToJDLEntity(entity, entityName));
    addEnumsToJDL(jdl, entity);
    addEntityOptionsToJDL(jdl, entity, entityName);
  }
  addRelationshipsToJDL(jdl, entities, skipUserManagement);
  return jdl;
}

/*
 * Parses the jhipster configuration into JDL
 * jhConfig: the jhipster config ('generator-jhipster' in .yo-rc.json)
 * jdl: JDLObject to which the parsed options are added. If undefined a new JDLObject is created.
 * returns the JDLObject
 */
function parseServerOptions(jhConfig, jdl) {
  if (!jdl) {
    jdl = new JDLObject();
  }
  [UnaryOptions.SKIP_CLIENT, UnaryOptions.SKIP_SERVER, UnaryOptions.SKIP_USER_MANAGEMENT].forEach((option) => {
    if (jhConfig[option] === true) {
      jdl.addOption(new JDLUnaryOption({
        name: option,
        value: jhConfig[option]
      }));
    }
  });
  return jdl;
}

function jsonToJDLEntity(entity, entityName) {
  const jdlEntity = new JDLEntity({
    name: entityName,
    tableName: entity.entityTableName,
    comment: entity.javadoc
  });
  entity.fields.forEach((field) => {
    jdlEntity.addField(jsonToJDLField(field));
  });
  return jdlEntity;
}

function jsonToJDLField(field) {
  const jdlField = new JDLField({
    name: _.lowerFirst(field.fieldName),
    type: field.fieldType,
    comment: field.javadoc
  });
  if (field.fieldValidateRules) {
    field.fieldValidateRules.forEach((rule) => {
      jdlField.addValidation(jsonToJDLValidation(rule, field));
    });
  }
  return jdlField;
}

function jsonToJDLValidation(rule, field) {
  return new JDLValidation({
    name: rule,
    value: field[`fieldValidateRules${_.upperFirst(rule)}`]
  });
}

function addEnumsToJDL(jdl, entity) {
  entity.fields.forEach((field) => {
    if (field.fieldValues !== undefined) {
      jdl.addEnum(new JDLEnum({
        name: field.fieldType,
        values: field.fieldValues.split(',')
      }));
    }
  });
}

/*
 * Adds relationships for entities to JDL.
 * The jdl passed must contain the jdl entities concerned by the relationships
 */
function addRelationshipsToJDL(jdl, entities, skipUserManagement) {
  for (let i = 0, entityNames = Object.keys(entities); i < entityNames.length; i++) {
    dealWithRelationships(jdl, entities[entityNames[i]].relationships, entityNames[i], entities, skipUserManagement);
  }
}

function dealWithRelationships(jdl, relationships, entityName, entities, skipUserManagement) {
  relationships.forEach((relationship) => {
    const jdlRelationship = getRelationship(relationship, jdl, entityName, entities, skipUserManagement);
    if (jdlRelationship) {
      jdl.addRelationship(jdlRelationship);
    }
  });
}

function getInjectedFieldInFrom(relationship) {
  return relationship.relationshipName
    + (relationship.otherEntityField && relationship.otherEntityField !== 'id'
      ? `(${relationship.otherEntityField})`
      : '');
}

function getRelationship(relationship, jdl, entityName, entities, skipUserManagement) {
  let type;
  let injectedFieldInTo;
  let isInjectedFieldInToRequired = false;
  let commentInTo;
  let otherEntity;
  let toJdlEntity;

  if (relationship.otherEntityName.toLowerCase() === USER.toLowerCase() && !skipUserManagement) {
    toJdlEntity = USER_ENTITY;
  } else {
    otherEntity = entities[_.upperFirst(relationship.otherEntityName)];
    if (!otherEntity) {
      return;
    }
    toJdlEntity = jdl.entities[_.upperFirst(relationship.otherEntityName)];

    for (let i = 0; i < otherEntity.relationships.length; i++) {
      const relationship2 = otherEntity.relationships[i];
      if (_.upperFirst(relationship2.otherEntityName) === entityName
        && relationship2.otherEntityRelationshipName === relationship.relationshipName) {
        // Bidirectional relationship
        injectedFieldInTo = relationship2.relationshipName;
        if (relationship2.otherEntityField !== undefined && relationship2.otherEntityField !== 'id') {
          injectedFieldInTo += `(${relationship2.otherEntityField})`;
        }
        if (relationship2.relationshipValidateRules) {
          isInjectedFieldInToRequired = true;
        }
        commentInTo = relationship2.javadoc;
        break;
      }
    }
  }
  if (relationship.relationshipType === 'many-to-one') {
    if (injectedFieldInTo) {
      // This is a bidirectional relationship so consider it as a OneToMany
      return new JDLRelationship({ // eslint-disable-line consistent-return
        from: jdl.entities[_.upperFirst(relationship.otherEntityName)],
        to: jdl.entities[entityName],
        type: RelationshipTypes.ONE_TO_MANY,
        injectedFieldInFrom: injectedFieldInTo,
        injectedFieldInTo: getInjectedFieldInFrom(relationship),
        isInjectedFieldInFromRequired: isInjectedFieldInToRequired,
        isInjectedFieldInToRequired: relationship.relationshipValidateRules,
        commentInFrom: commentInTo,
        commentInTo: relationship.javadoc
      });
    }
    // Unidirectional ManyToOne
    type = RelationshipTypes.MANY_TO_ONE;
  } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide === true) {
    type = RelationshipTypes.ONE_TO_ONE;
  } else if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide === true) {
    type = RelationshipTypes.MANY_TO_MANY;
  }
  if (type) {
    return new JDLRelationship({ // eslint-disable-line consistent-return
      from: jdl.entities[entityName],
      to: toJdlEntity,
      type,
      injectedFieldInFrom: getInjectedFieldInFrom(relationship),
      injectedFieldInTo,
      isInjectedFieldInFromRequired: relationship.relationshipValidateRules,
      isInjectedFieldInToRequired,
      commentInFrom: relationship.javadoc,
      commentInTo
    });
  }
}

function addEntityOptionsToJDL(jdl, entity, entityName) {
  if (entity.fluentMethods === false) {
    jdl.addOption(
      new JDLUnaryOption(
        {
          name: UnaryOptions.NO_FLUENT_METHOD,
          entityNames: [entityName]
        }
      )
    );
  }
  [BinaryOptions.DTO, BinaryOptions.PAGINATION, BinaryOptions.SERVICE, BinaryOptions.SEARCH_ENGINE].forEach((option) => {
    if (entity[option] && entity[option] !== 'no') {
      jdl.addOption(
        new JDLBinaryOption(
          {
            name: option,
            value: entity[option],
            entityNames: [entityName]
          }
        )
      );
    }
  });
  // angularSuffix in BINARY_OPTIONS, angularJSSuffix in Json
  if (entity.angularJSSuffix !== undefined) {
    jdl.addOption(
      new JDLBinaryOption(
        {
          name: BinaryOptions.ANGULAR_SUFFIX,
          value: entity.angularJSSuffix,
          entityNames: [entityName]
        }
      )
    );
  }
  // microservice in BINARY_OPTIONS, microserviceName in Json
  if (entity.microserviceName !== undefined) {
    jdl.addOption(
      new JDLBinaryOption(
        {
          name: BinaryOptions.MICROSERVICE,
          value: entity.microserviceName,
          entityNames: [entityName]
        }
      )
    );
  }
}

function hasSkipUserManagement(jdl) {
  return jdl.options.has(UnaryOptions.SKIP_USER_MANAGEMENT);
}
