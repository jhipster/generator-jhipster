/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const BINARY_OPTIONS = require('../lib/core/jhipster/binary_options');
const UNARY_OPTIONS = require('../lib/core/jhipster/unary_options');
const RELATIONSHIP_TYPES = require('../lib/core/jhipster/relationship_types');
const FIELD_TYPES = require('../lib/core/jhipster/field_types');
const VALIDATIONS = require('../lib/core/jhipster/validations');
const DATABASE_TYPES = require('../lib/core/jhipster/database_types');
const JDLReader = require('../lib/reader/jdl_reader');
const JsonReader = require('../lib/reader/json_reader');
const JDLParser = require('../lib/parser/jdl_parser');
const convertToJHipsterJSON = require('../lib/parser/entity_parser').parse;
const JsonParser = require('../lib/parser/json_parser');
const JDLObject = require('../lib/core/jdl_object');
const JDLEntity = require('../lib/core/jdl_entity');
const JDLField = require('../lib/core/jdl_field');
const JDLValidation = require('../lib/core/jdl_validation');
const JDLEnum = require('../lib/core/jdl_enum');
const JDLRelationship = require('../lib/core/jdl_relationship');
const JDLRelationships = require('../lib/core/jdl_relationships');
const JDLUnaryOption = require('../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../lib/core/jdl_binary_option');
const JDLOptions = require('../lib/core/jdl_options');
const JSONExporter = require('../lib/export/json_exporter');
const exportToJDL = require('../lib/export/jdl_exporter').exportToJDL;
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
  convertToJDLFromConfigurationObject: JDLParser.parseFromConfigurationObject,
  convertToJHipsterJSON,
  /* Json conversion */
  convertJsonEntitiesToJDL: JsonParser.parseEntities,
  convertJsonServerOptionsToJDL: JsonParser.parseServerOptions,
  /* JSON exporting */
  exportToJSON: JSONExporter.exportToJSON,
  /* JDL exporting */
  exportToJDL,
  /* JDL utils */
  isJDLFile: JDLReader.checkFileIsJDLFile,
  /* JSON utils */
  ObjectUtils,
  createJHipsterJSONFolder: JSONExporter.createJHipsterJSONFolder,
  filterOutUnchangedEntities: JSONExporter.filterOutUnchangedEntities,
  readEntityJSON: JSONFileReader.readEntityJSON,
  toFilePath: JSONFileReader.toFilePath,
  /* Objects */
  Set,
  /* Utils */
  camelCase: StringUtils.camelCase,
  dateFormatForLiquibase: FormatUtils.dateFormatForLiquibase
};
