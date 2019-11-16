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

const ValidatedJDLObject = require('../lib/core/validated_jdl_object');
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
const ValidatedJDLOptions = require('../lib/core/validated_jdl_options');

const ApplicationTypes = require('../lib/core/jhipster/application_types');
const BinaryOptions = require('../lib/core/jhipster/binary_options');
const UnaryOptions = require('../lib/core/jhipster/unary_options');
const RelationshipOptions = require('../lib/core/jhipster/relationship_options');
const RelationshipTypes = require('../lib/core/jhipster/relationship_types');
const FieldTypes = require('../lib/core/jhipster/field_types');
const Validations = require('../lib/core/jhipster/validations');
const DatabaseTypes = require('../lib/core/jhipster/database_types');
const ReservedKeywords = require('../lib/core/jhipster/reserved_keywords');
const DeploymentOptions = require('../lib/core/jhipster/deployment_options');

const JDLExporter = require('../lib/exporters/jdl_exporter');
const JDLImporter = require('../lib/jdl/jdl_importer');

const JHipsterApplicationExporter = require('../lib/exporters/jhipster_application_exporter');
const JHipsterEntityExporter = require('../lib/exporters/jhipster_entity_exporter');
const JHipsterDeploymentExporter = require('../lib/exporters/jhipster_deployment_exporter');

const JSONToJDLConverter = require('../lib/converters/json_to_jdl_converter');

const LintRules = require('../lib/linter/rules');
const { createJDLLinterFromFile, createJDLLinterFromContent } = require('../lib/linter/jdl_linter');

module.exports = {
  jdl: {
    conversion: {
      JSONToJDLConverter
    },
    export: {
      JDLExporter
    },
    import: {
      JDLImporter
    },
    linting: {
      LintRules,
      JDLLinter: {
        createJDLLinterFromFile,
        createJDLLinterFromContent
      }
    },
    objects: {
      ValidatedJDLObject,
      JDLObject,
      JDLEntity,
      JDLField,
      JDLValidation,
      JDLEnums,
      JDLEnum,
      JDLRelationships,
      JDLRelationship,
      JDLOptions,
      ValidatedJDLOptions,
      JDLUnaryOption,
      JDLBinaryOption,
      JDLMonolithApplication,
      JDLMicroserviceApplication,
      JDLGatewayApplication,
      JDLUaaApplication
    }
  },
  jhipster: {
    ApplicationTypes,
    UnaryOptions,
    BinaryOptions,
    RelationshipOptions,
    RelationshipTypes,
    FieldTypes,
    Validations,
    DatabaseTypes,
    ReservedKeywords,
    DeploymentOptions
  },
  json: {
    export: {
      JHipsterApplicationExporter,
      JHipsterEntityExporter,
      JHipsterDeploymentExporter
    }
  }
};
