/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const ApplicationTypes = require('../lib/core/jhipster/application_types');
const BinaryOptions = require('../lib/core/jhipster/binary_options');
const UnaryOptions = require('../lib/core/jhipster/unary_options');
const RelationshipTypes = require('../lib/core/jhipster/relationship_types');
const FieldTypes = require('../lib/core/jhipster/field_types');
const Validations = require('../lib/core/jhipster/validations');
const DatabaseTypes = require('../lib/core/jhipster/database_types');
const LintRules = require('../lib/linter/rules');

const JDLObject = require('../lib/core/jdl_object');
const JDLMonolithApplication = require('../lib/core/jdl_monolith_application');
const JDLGatewayApplication = require('../lib/core/jdl_gateway_application');
const JDLMicroserviceApplication = require('../lib/core/jdl_microservice_application');
const JDLUaaApplication = require('../lib/core/jdl_uaa_application');
const JDLEntity = require('../lib/core/jdl_entity');
const JDLField = require('../lib/core/jdl_field');
const JDLValidation = require('../lib/core/jdl_validation');
const JDLEnums = require('../lib/core/jdl_enums');
const JDLEnum = require('../lib/core/jdl_enum');
const JDLRelationship = require('../lib/core/jdl_relationship');
const JDLRelationships = require('../lib/core/jdl_relationships');
const JDLUnaryOption = require('../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../lib/core/jdl_binary_option');
const JDLOptions = require('../lib/core/jdl_options');

const JDLImporter = require('../lib/jdl/jdl_importer');
const JDLLinter = require('../lib/linter/jdl_linter');
const JDLReader = require('../lib/readers/jdl_reader');
const JsonReader = require('../lib/readers/json_reader');
const DocumentParser = require('../lib/parsers/document_parser');
const EntityParser = require('../lib/parsers/entity_parser');
const { convertApplicationsToJDL } = require('../lib/converters/json_to_jdl_application_converter');
const { convertEntitiesToJDL } = require('../lib/converters/json_to_jdl_entity_converter');
const { convertServerOptionsToJDL } = require('../lib/converters/json_to_jdl_option_converter');
const JHipsterApplicationExporter = require('../lib/exporters/jhipster_application_exporter');
const JHipsterEntityExporter = require('../lib/exporters/jhipster_entity_exporter');
const JDLExporter = require('../lib/exporters/jdl_exporter');
const JSONFileReader = require('../lib/readers/json_file_reader');
const { convertToJDL } = require('../lib/converters/json_to_jdl_converter');
const ReservedKeywords = require('../lib/core/jhipster/reserved_keywords');
const FileUtils = require('../lib/utils/file_utils');
const ObjectUtils = require('../lib/utils/object_utils');
const FormatUtils = require('../lib/utils/format_utils');
const StringUtils = require('../lib/utils/string_utils');

module.exports = {
  /* JHipster notions */
  JHipsterApplicationTypes: ApplicationTypes,
  JHipsterBinaryOptions: BinaryOptions,
  JHipsterUnaryOptions: UnaryOptions,
  JHipsterRelationshipTypes: RelationshipTypes,
  JHipsterValidations: Validations,
  JHipsterFieldTypes: FieldTypes,
  JHipsterDatabaseTypes: DatabaseTypes,
  isReservedKeyword: ReservedKeywords.isReserved,
  isReservedClassName: ReservedKeywords.isReservedClassName,
  isReservedTableName: ReservedKeywords.isReservedTableName,
  isReservedFieldName: ReservedKeywords.isReservedFieldName,
  /* JDL objects */
  JDLObject,
  JDLMonolithApplication,
  JDLGatewayApplication,
  JDLMicroserviceApplication,
  JDLUaaApplication,
  JDLEntity,
  JDLField,
  JDLValidation,
  JDLEnums,
  JDLEnum,
  JDLRelationship,
  JDLRelationships,
  JDLUnaryOption,
  JDLBinaryOption,
  JDLOptions,
  /* JDL Importer */
  JDLImporter,
  /* JDL Linting */
  JDLLinter,
  LintRules,
  /* JDL reading */
  parseFromFiles: JDLReader.parseFromFiles,
  /* JSON reading */
  parseJsonFromDir: JsonReader.parseFromDir,
  /* JDL conversion */
  convertToJDLFromConfigurationObject: DocumentParser.parseFromConfigurationObject,
  convertToJHipsterJSON: EntityParser.parse,
  /* JSON  conversion */
  convertJsonApplicationsToJDL: convertApplicationsToJDL,
  convertJsonEntitiesToJDL: convertEntitiesToJDL,
  convertJsonServerOptionsToJDL: convertServerOptionsToJDL,
  /* Entity exporting to JSON */
  exportEntities: JHipsterEntityExporter.exportEntities,
  exportEntitiesInApplications: JHipsterEntityExporter.exportEntitiesInApplications,
  /* Application exporting */
  exportApplications: JHipsterApplicationExporter.exportApplications,
  exportApplication: JHipsterApplicationExporter.exportApplication,
  /* JDL exporting */
  exportToJDL: JDLExporter.exportToJDL,
  convertToJDL,
  /* JDL utils */
  isJDLFile: JDLReader.checkFileIsJDLFile,
  /* JSON utils */
  ObjectUtils,
  readEntityJSON: JSONFileReader.readEntityJSON,
  toFilePath: JSONFileReader.toFilePath,
  /* Utils */
  FileUtils,
  camelCase: StringUtils.camelCase,
  dateFormatForLiquibase: FormatUtils.dateFormatForLiquibase
};
