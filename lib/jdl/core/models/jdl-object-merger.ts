/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import type AbstractJDLOption from './abstract-jdl-option.ts';
import type JDLApplication from './jdl-application.ts';
import type JDLEntity from './jdl-entity.ts';
import type JDLEnum from './jdl-enum.ts';
import JDLObject from './jdl-object.js';
import type JDLRelationship from './jdl-relationship.ts';

/**
 * Merges two JDL objects together, without altering any of the two passed objects.
 * @param {JDLObject} firstJDLObject the first JDL object to merge.
 * @param {JDLObject} secondJDLObject the second one.
 * @return {JDLObject} the merged JDL object.
 */
export default function mergeJDLObjects(firstJDLObject: JDLObject, secondJDLObject: JDLObject): JDLObject {
  if (!firstJDLObject || !secondJDLObject) {
    throw new Error("Can't merge nil JDL objects.");
  }
  const merged = new JDLObject();
  const addApplication = (application: JDLApplication) => merged.addApplication(application);
  const addEntity = (entity: JDLEntity) => merged.addEntity(entity);
  const addEnumeration = (enumeration: JDLEnum) => merged.addEnum(enumeration);
  const addRelationship = (relationship: JDLRelationship) => merged.addRelationship(relationship);
  const addOption = (option: AbstractJDLOption) => merged.addOption(option);

  firstJDLObject.forEachApplication(addApplication);
  secondJDLObject.forEachApplication(addApplication);
  firstJDLObject.forEachEntity(addEntity);
  secondJDLObject.forEachEntity(addEntity);
  firstJDLObject.forEachEnum(addEnumeration);
  secondJDLObject.forEachEnum(addEnumeration);
  firstJDLObject.forEachRelationship(addRelationship);
  secondJDLObject.forEachRelationship(addRelationship);
  firstJDLObject.forEachOption(addOption);
  secondJDLObject.forEachOption(addOption);
  return merged;
}
