/** Copyright 2013-2019 the original author or authors from the JHipster project.
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

module.exports = {
  getFieldDeclarationsFromEntity,
  getAllFieldDeclarations
};

function getAllFieldDeclarations(cst) {
  return cst.children.entityDeclaration.reduce((fieldDeclarations, entityDeclaration) => {
    return fieldDeclarations.concat(getFieldDeclarationsFromEntity(entityDeclaration));
  }, []);
}

function getFieldDeclarationsFromEntity(entityDeclaration) {
  if (entityDeclaration.children.entityBody && entityDeclaration.children.entityBody[0].children.fieldDeclaration) {
    return entityDeclaration.children.entityBody[0].children.fieldDeclaration;
  }
  return [];
}
