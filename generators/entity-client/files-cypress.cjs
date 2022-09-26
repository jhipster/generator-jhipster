/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const cypressEntityFiles = {
  testsCypress: [
    {
      condition: generator => generator.cypressTests && !generator.embedded,
      path: generator => generator.cypressFolder,
      templates: [
        {
          file: 'e2e/entity/entity.cy.ts',
          renameTo: generator => `e2e/entity/${generator.entityFileName}.cy.ts`,
        },
      ],
    },
  ],
};

function cleanupCypressEntityFiles() {
  const { entity, application } = this;
  if (!application.cypressTests) return;
  application.cypressFolder = `${this.CLIENT_TEST_SRC_DIR}cypress/`;
  if (this.isJhipsterVersionLessThan('7.8.2')) {
    this.removeFile(`${application.cypressFolder}integration/entity/${entity.entityFileName}.spec.ts`);
  }
}

function writeCypressEntityFiles() {
  const { entity, application } = this;
  if (entity.skipClient || !application.cypressTests) return undefined;
  application.cypressFolder = `${this.CLIENT_TEST_SRC_DIR}cypress/`;
  return this.writeFiles({
    sections: cypressEntityFiles,
    rootTemplatesPath: 'cypress',
    context: { ...application, ...entity },
  });
}

module.exports = {
  cypressEntityFiles,
  cleanupCypressEntityFiles,
  writeCypressEntityFiles,
};
