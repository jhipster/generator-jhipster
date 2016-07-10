'use strict';

const BINARY_OPTIONS = require('../lib/core/jhipster/binary_options'),
    UNARY_OPTIONS = require('../lib/core/jhipster/unary_options'),
    RELATIONSHIP_TYPES = require('../lib/core/jhipster/relationship_types'),
    FIELD_TYPES = require('../lib/core/jhipster/field_types'),
    VALIDATIONS = require('../lib/core/jhipster/validations'),
    DATABASE_TYPES = require('../lib/core/jhipster/database_types'),
    JDLReader = require('../lib/reader/jdl_reader'),
    JDLParser = require('../lib/parser/jdl_parser'),
    EntityParser = require('../lib/parser/entity_parser'),
    JDLObject = require('../lib/core/jdl_object'),
    JDLEntity = require('../lib/core/jdl_entity'),
    JDLField = require('../lib/core/jdl_field'),
    JDLValidation = require('../lib/core/jdl_validation'),
    JDLEnum = require('../lib/core/jdl_enum'),
    JDLRelationship = require('../lib/core/jdl_relationship'),
    JDLRelationships = require('../lib/core/jdl_relationships'),
    JDLUnaryOption = require('../lib/core/jdl_unary_option'),
    JDLBinaryOption = require('../lib/core/jdl_binary_option'),
    exportToJSON = require('../lib/export/json_exporter').exportToJSON,
    createJHipsterJSONFolder = require('../lib/export/json_exporter').createJHipsterJSONFolder,
    toFilePath = require('../lib/reader/json_file_reader').toFilePath,
    readEntityJSON = require('../lib/reader/json_file_reader').readEntityJSON,
    ObjectUtils = require('../lib/utils/object_utils'),
    Set = require('../lib/utils/objects/set');

module.exports = {
  /* JHipster notions */
  JHipsterBinaryOptions: BINARY_OPTIONS,
  JHipsterUnaryOptions: UNARY_OPTIONS,
  JHipsterRelationshipTypes: RELATIONSHIP_TYPES,
  JHipsterValidations: VALIDATIONS,
  JHipsterFieldTypes: FIELD_TYPES,
  JHipsterDatabaseTypes: DATABASE_TYPES,
  /* JDL objects */
  JDLObject: JDLObject,
  JDLEntity: JDLEntity,
  JDLField: JDLField,
  JDLValidation: JDLValidation,
  JDLEnum: JDLEnum,
  JDLRelationship: JDLRelationship,
  JDLRelationships: JDLRelationships,
  JDLUnaryOption: JDLUnaryOption,
  JDLBinaryOption: JDLBinaryOption,
  /* JDL reading */
  parse: JDLReader.parse,
  parseFromFiles: JDLReader.parseFromFiles,
  /* JDL conversion */
  convertToJDL: JDLParser.parse,
  convertToJHipsterJSON: EntityParser.parse,
  /* JSON exporting */
  exportToJSON: exportToJSON,
  /* JDL utils */
  isJDLFile: JDLReader.checkFileIsJDLFile,
  /* JSON utils */
  ObjectUtils: ObjectUtils,
  createJHipsterJSONFolder: createJHipsterJSONFolder,
  readEntityJSON: readEntityJSON,
  toFilePath: toFilePath,
  /* Objects */
  Set: Set
};
