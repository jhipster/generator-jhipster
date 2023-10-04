/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { IJSONSecure, JSONSecure } from '../../jhipster/json-secure.js';
import { JDLEntity } from '../../models/index.mjs';
import { JDLSecurityType } from '../../models/jdl-security-type.js';

export default {
  convert,
};

/**
 * Converts secure clause to JSON content,
 * @param jdlEntities  - the JDL object containing entities with secure property.
 * @returns {Map<string, IJSONSecure>} a map having for keys an entity's name and for values its JSON secure clause.
 */
function convert(jdlEntities: JDLEntity[]): Map<string, IJSONSecure> {
  if (!jdlEntities) {
    throw new Error('A JDL entities must be passed to convert JDL security to JSON.');
  }
  const convertedSecureClauses = new Map();

  jdlEntities.forEach(jdlEntity => {
    const convertedSecure = getConvertedSecureForEntity(jdlEntity);
    convertedSecureClauses.set(jdlEntity.name, convertedSecure);
  });

  return convertedSecureClauses;
}

/**
 * Converts a JDLEntity object to an IJSONSecure object with security configurations.
 *
 * @param {JDLEntity} jdlEntity - The JDLEntity object to be converted.
 * @returns {IJSONSecure} - The converted IJSONSecure object with security configurations.
 */
function getConvertedSecureForEntity(jdlEntity: JDLEntity): IJSONSecure {
  const jsonSecure: JSONSecure = new JSONSecure({ securityType: JDLSecurityType.None });

  if (jdlEntity.secure) {
    jsonSecure.addConfigFromJDLSecure(jdlEntity.secure);
  }

  return jsonSecure;
}
