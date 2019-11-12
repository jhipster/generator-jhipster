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

const ApplicationValidator = require('../exceptions/application_validator');
const EntityValidator = require('../exceptions/entity_validator');
const DeploymentValidator = require('../exceptions/deployment_validator');
const UnaryOptionValidator = require('../exceptions/unary_option_validator');
const BinaryOptionValidator = require('../exceptions/binary_option_validator');
const EnumValidator = require('../exceptions/enum_validator');
const RelationshipValidator = require('../exceptions/relationship_validator');
const ValidatedJDLOptions = require('./validated_jdl_options');
const JDLObject = require('./jdl_object');

/**
 * The JDL object class, containing applications, entities etc.
 */
class ValidatedJDLObject extends JDLObject {
  constructor() {
    super();
    this.options = new ValidatedJDLOptions();
    this.applicationValidator = new ApplicationValidator();
    this.entityValidator = new EntityValidator();
    this.deploymentValidator = new DeploymentValidator();
    this.unaryOptionValidator = new UnaryOptionValidator();
    this.binaryOptionValidator = new BinaryOptionValidator();
    this.enumValidator = new EnumValidator();
    this.relationshipValidator = new RelationshipValidator();
  }

  /**
   * Adds or replaces an application.
   * @param application the application.
   */
  addApplication(application) {
    try {
      this.applicationValidator.validate(application);
    } catch (error) {
      throw new Error(`Can't add invalid application. ${error}`);
    }
    super.addApplication(application);
  }

  /**
   * Adds or replaces a deployment.
   * @param deployment the deployment.
   */
  addDeployment(deployment) {
    try {
      this.deploymentValidator.validate(deployment);
    } catch (error) {
      throw new Error(`Can't add invalid deployment. ${error}`);
    }
    super.addDeployment(deployment);
  }

  /**
   * Adds or replaces an entity.
   * @param entity the entity to add.
   */
  addEntity(entity) {
    try {
      this.entityValidator.validate(entity);
    } catch (error) {
      throw new Error(`Can't add invalid entity. ${error}`);
    }
    super.addEntity(entity);
  }

  /**
   * Adds or replaces an enum.
   * @param enumToAdd the enum to add.
   */
  addEnum(enumToAdd) {
    try {
      this.enumValidator.validate(enumToAdd);
    } catch (error) {
      throw new Error(`Can't add invalid enum. ${error}`);
    }
    super.addEnum(enumToAdd);
  }

  addRelationship(relationship) {
    try {
      this.relationshipValidator.validate(relationship);
    } catch (error) {
      throw new Error(`Can't add invalid relationship. ${error}`);
    }
    super.addRelationship(relationship);
  }

  addOption(option) {
    if (!option || !option.getType) {
      throw new Error("Can't add nil option.");
    }
    try {
      if (option.getType() === 'UNARY') {
        this.unaryOptionValidator.validate(option);
      } else {
        this.binaryOptionValidator.validate(option);
      }
    } catch (error) {
      throw new Error(`Can't add invalid option. ${error}`);
    }
    super.addOption(option);
  }
}

module.exports = ValidatedJDLObject;
