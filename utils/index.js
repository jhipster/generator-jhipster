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

module.exports = {
  stringify: data =>
    JSON.stringify(
      data,
      (key, value) => {
        if (!value) {
          return value;
        }
        if (key === 'faker') {
          return '[faker]';
        }
        if (key === 'otherEntity' || key === 'entity') {
          return `[${value.name} Entity]`;
        }
        if (key === 'reference') {
          return `[${value.name} Reference]`;
        }
        if (key === 'otherRelationship') {
          return `[${value.relationshipName} relationship]`;
        }
        if (key === 'otherRelationships') {
          return '[otherRelationships]';
        }
        if (key === 'derivedPrimaryKey') {
          return `[${value.type} derivedPrimaryKey]`;
        }
        if (key === 'derivedFields') {
          return '[derivedFields]';
        }
        return value;
      },
      4
    ),
};
