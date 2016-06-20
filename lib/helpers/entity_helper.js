'use strict';

module.exports = {
  isAValidDTO: isAValidDTO,
  isAValidPagination: isAValidPagination,
  isAValidService: isAValidService,
  isAnId: isAnId,
  areJHipsterEntitiesEqual: areJHipsterEntitiesEqual
};

const DTO_OPTIONS = {mapstruct: null};
const PAGINATION_OPTIONS = {
  pager: null,
  pagination: null,
  'infinite-scroll': null
};
const SERVICE_OPTIONS = {
  serviceClass: null,
  serviceImpl: null
};
const SEARCH_ENGINE_OPTIONS = {elasticsearch: null};

/**
 * Checks whether the passed dto option is valid.
 * @param {string} the dto option.
 * @return {boolean}
 */
function isAValidDTO(dto) {
  return DTO_OPTIONS.hasOwnProperty(dto);
}

/**
 * Checks whether the passed pagination option is valid.
 * @param {string} the pagination option.
 * @return {boolean}
 */
function isAValidPagination(pagination) {
  return PAGINATION_OPTIONS.hasOwnProperty(pagination);
}

/**
 * Checks whether the passed service option is valid.
 * @param {string} the service option.
 * @return {boolean}
 */
function isAValidService(service) {
  return SERVICE_OPTIONS.hasOwnProperty(service);
}

/**
 * Checks whether the passed name is an id.
 * @param {string} name the field's name.
 * @return {boolean}
 */
function isAnId(name) {
  return /^id$/.test(name.toLowerCase());
};

/**
 * Checks whether two entities are equal
 * @param {object} first entity object
 * @param {object} second entity object
 * @return {boolean}
 */
function areJHipsterEntitiesEqual(firstEntity, secondEntity) {
  if (firstEntity.fields.length !== secondEntity.fields.length
      || firstEntity.relationships.length !== secondEntity.relationships.length) {
    return false;
  }
  return areFieldsEqual(firstEntity.fields, secondEntity.fields)
    && areRelationshipsEqual(firstEntity.relationships, secondEntity.relationships);
}

/* private methods */
function areFieldsEqual(firstFields, secondFields) {
  return firstFields.every(function(field, index) {
    if (Object.keys(field).length !== Object.keys(secondFields[index]).length) {
      return false;
    }
    var secondEntityField = secondFields[index];
    return Object.keys(field).every(function(key) {
      return field[key] === secondEntityField[key];
    });
  });
}

function areRelationshipsEqual(firstRelationships, secondRelationships) {
  return firstRelationships.every(function(relationship, index) {
    if (Object.keys(relationship).length !== Object.keys(secondRelationships[index]).length) {
      return false;
    }
    var secondEntityRelationship = secondRelationships[index];
    return Object.keys(relationship).every(function(key) {
      return relationship[key] === secondEntityRelationship[key];
    });
  });
}
