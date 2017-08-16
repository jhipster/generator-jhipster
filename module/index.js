const BINARY_OPTIONS = require('../lib/core/jhipster/binary_options');
const UNARY_OPTIONS = require('../lib/core/jhipster/unary_options');
const RELATIONSHIP_TYPES = require('../lib/core/jhipster/relationship_types');
const FIELD_TYPES = require('../lib/core/jhipster/field_types');
const VALIDATIONS = require('../lib/core/jhipster/validations');
const DATABASE_TYPES = require('../lib/core/jhipster/database_types');
const JDLReader = require('../lib/reader/jdl_reader');
const JsonReader = require('../lib/reader/json_reader');
const JDLParser = require('../lib/parser/jdl_parser');
const EntityParser = require('../lib/parser/entity_parser');
const JsonParser = require('../lib/parser/json_parser');
const JDLObject = require('../lib/core/jdl_object');
const JDLApplication = require('../lib/core/jdl_application');
const JDLEntity = require('../lib/core/jdl_entity');
const JDLField = require('../lib/core/jdl_field');
const JDLValidation = require('../lib/core/jdl_validation');
const JDLEnum = require('../lib/core/jdl_enum');
const JDLRelationship = require('../lib/core/jdl_relationship');
const JDLRelationships = require('../lib/core/jdl_relationships');
const JDLUnaryOption = require('../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../lib/core/jdl_binary_option');
const JDLOptions = require('../lib/core/jdl_options');
const JHipsterApplicationExporter = require('../lib/export/jhipster_application_exporter');
const JHipsterEntityExporter = require('../lib/export/jhipster_entity_exporter');
const JDLExporter = require('../lib/export/jdl_exporter');
const JSONFileReader = require('../lib/reader/json_file_reader');
const ReservedKeywords = require('../lib/core/jhipster/reserved_keywords');
const ObjectUtils = require('../lib/utils/object_utils');
const FormatUtils = require('../lib/utils/format_utils');
const StringUtils = require('../lib/utils/string_utils');
const Set = require('../lib/utils/objects/set');

module.exports = {
  /* JHipster notions */
  JHipsterBinaryOptions: BINARY_OPTIONS,
  JHipsterUnaryOptions: UNARY_OPTIONS,
  JHipsterRelationshipTypes: RELATIONSHIP_TYPES,
  JHipsterValidations: VALIDATIONS,
  JHipsterFieldTypes: FIELD_TYPES,
  JHipsterDatabaseTypes: DATABASE_TYPES,
  isReservedKeyword: ReservedKeywords.isReserved,
  isReservedClassName: ReservedKeywords.isReservedClassName,
  isReservedTableName: ReservedKeywords.isReservedTableName,
  isReservedFieldName: ReservedKeywords.isReservedFieldName,

  /* JDL objects */
  JDLObject,
  JDLApplication,
  JDLEntity,
  JDLField,
  JDLValidation,
  JDLEnum,
  JDLRelationship,
  JDLRelationships,
  JDLUnaryOption,
  JDLBinaryOption,
  JDLOptions,

  /* JDL reading */
  parse: JDLReader.parse,
  parseFromFiles: JDLReader.parseFromFiles,
  /* Json reading */
  parseJsonFromDir: JsonReader.parseFromDir,
  /* JDL conversion */
  convertToJDL: JDLParser.parse,
  convertToJHipsterJSON: EntityParser.parse,
  /* Json conversion */
  convertJsonEntitiesToJDL: JsonParser.parseEntities,
  convertJsonServerOptionsToJDL: JsonParser.parseServerOptions,

  /* Application exporting */
  exportApplications: JHipsterApplicationExporter.exportApplications,

  /* Entity exporting */
  exportEntities: JHipsterEntityExporter.exportEntities,
  createJHipsterEntityFolderFolder: JHipsterEntityExporter.createJHipsterEntityFolderFolder,
  filterOutUnchangedEntities: JHipsterEntityExporter.filterOutUnchangedEntities,

  /* JDL exporting */
  exportToJDL: JDLExporter.exportToJDL,

  /* JDL utils */
  isJDLFile: JDLReader.checkFileIsJDLFile,

  /* JSON utils */
  ObjectUtils,
  readEntityJSON: JSONFileReader.readEntityJSON,
  toFilePath: JSONFileReader.toFilePath,

  /* Objects */
  Set,

  /* Utils */
  camelCase: StringUtils.camelCase,
  dateFormatForLiquibase: FormatUtils.dateFormatForLiquibase
};
