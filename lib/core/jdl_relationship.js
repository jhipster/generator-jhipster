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
const logger = require('../utils/objects/logger');
const merge = require('../utils/object_utils').merge;
const RelationshipTypes = require('./jhipster/relationship_types');
const { lowerFirst } = require('../utils/string_utils');

class JDLRelationship {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.from || !merged.to) {
      throw new Error('Source and destination entities must be passed to create a relationship.');
    }
    checkFromAndToTypesAreString(merged);
    if (!RelationshipTypes.exists(merged.type) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
      throw new Error('A valid type and at least one injected field must be passed to create a relationship.');
    }
    if (merged.type === RelationshipTypes.ONE_TO_MANY && (!merged.injectedFieldInFrom || !merged.injectedFieldInTo)) {
      logger.warn(
        `In the One-to-Many relationship from ${merged.from} to ${merged.to}, ` +
          'only bidirectionality is supported for a One-to-Many association. ' +
          'The other side will be automatically added.'
      );
      addMissingSide(merged);
    }
    this.from = merged.from;
    this.to = merged.to;
    this.type = merged.type;
    this.options = merged.options;
    this.injectedFieldInFrom = merged.injectedFieldInFrom;
    this.injectedFieldInTo = merged.injectedFieldInTo;
    this.isInjectedFieldInFromRequired = merged.isInjectedFieldInFromRequired;
    this.isInjectedFieldInToRequired = merged.isInjectedFieldInToRequired;
    this.commentInFrom = merged.commentInFrom;
    this.commentInTo = merged.commentInTo;
  }

  /**
   * Returns a constructed ID representing this relationship.
   * @return {String} the relationship's id.
   */
  getId() {
    return (
      `${this.type}_${this.from}${this.injectedFieldInFrom ? `{${this.injectedFieldInFrom}}` : ''}` +
      `_${this.to}${this.injectedFieldInTo ? `{${this.injectedFieldInTo}}` : ''}`
    );
  }

  hasOption(option) {
    return option in this.options;
  }

  forEachOption(passedFunction) {
    Object.values(this.options).forEach(passedFunction);
  }

  toString() {
    let string = `relationship ${this.type} {\n  `;
    if (this.commentInFrom) {
      string += `/**\n${this.commentInFrom
        .split('\n')
        .map(line => `   * ${line}\n`)
        .join('')}   */\n  `;
    }
    string += `${this.from}`;
    if (this.injectedFieldInFrom) {
      string += `{${this.injectedFieldInFrom}${this.isInjectedFieldInFromRequired ? ' required' : ''}}`;
    }
    string += ' to';
    if (this.commentInTo) {
      string += `\n  /**\n${this.commentInTo
        .split('\n')
        .map(line => `   * ${line}\n`)
        .join('')}   */\n  `;
    } else {
      string += ' ';
    }
    string += `${this.to}`;
    if (this.injectedFieldInTo) {
      string += `{${this.injectedFieldInTo}${this.isInjectedFieldInToRequired ? ' required' : ''}}`;
    }
    if (Object.keys(this.options).length !== 0) {
      string += ' with ';
      Object.keys(this.options).forEach(name => {
        string += `${name}, `;
      });
      string = string.substring(0, string.length - 2);
    }
    string += '\n}';
    return string;
  }
}

module.exports = JDLRelationship;

function defaults() {
  return {
    type: RelationshipTypes.ONE_TO_ONE,
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    isInjectedFieldInFromRequired: false,
    isInjectedFieldInToRequired: false,
    options: {},
    commentInFrom: '',
    commentInTo: ''
  };
}

function checkFromAndToTypesAreString(merged) {
  if (typeof merged.from === 'string' && typeof merged.to === 'string') {
    return;
  }
  logger.warn(
    "The 'from' and 'to' keys will only be accepted as strings in the next major version instead of " +
      `JDLEntities, for relationship from '${merged.from.name}' to '${merged.to.name}'.`
  );
  if (typeof merged.from !== 'string') {
    merged.from = merged.from.name;
  }
  if (typeof merged.to !== 'string') {
    merged.to = merged.to.name;
  }
}

function addMissingSide(relationship) {
  if (!relationship.injectedFieldInFrom) {
    relationship.injectedFieldInFrom = lowerFirst(relationship.to);
    return;
  }
  relationship.injectedFieldInTo = lowerFirst(relationship.from);
}
