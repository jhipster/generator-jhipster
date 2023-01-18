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
import logger from '../utils/objects/logger.js';
import { relationshipTypes, validations } from '../jhipster/index.mjs';
import { lowerFirst } from '../utils/string-utils.js';

const {
  Validations: { REQUIRED },
} = validations;

export default class JDLRelationship {
  from: any;
  to: any;
  type: any;
  options: any;
  injectedFieldInFrom: any;
  injectedFieldInTo: any;
  isInjectedFieldInFromRequired: any;
  isInjectedFieldInToRequired: any;
  commentInFrom: any;
  commentInTo: any;

  constructor(args) {
    const merged = mergeDefaultsWithOverrides(args);
    if (!merged.from || !merged.to) {
      throw new Error('Source and destination entities must be passed to create a relationship.');
    }
    checkFromAndToTypesAreString(merged);
    if (!relationshipTypes.exists(merged.type) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
      throw new Error('A valid type and at least one injected field must be passed to create a relationship.');
    }
    if (
      merged.type === relationshipTypes.ONE_TO_MANY &&
      (!merged.injectedFieldInFrom || !merged.injectedFieldInTo) &&
      !merged.unidirectionalRelationships
    ) {
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

  hasGlobalOption(option) {
    return option in this.options.global;
  }

  forEachGlobalOption(passedFunction) {
    Object.entries(this.options.global).forEach(([key, value]) => {
      passedFunction(key, value);
    });
  }

  forEachSourceOption(passedFunction) {
    Object.entries(this.options.source).forEach(([key, value]) => {
      passedFunction(key, value);
    });
  }

  forEachDestinationOption(passedFunction) {
    Object.entries(this.options.destination).forEach(([key, value]) => {
      passedFunction(key, value);
    });
  }

  // TODO: refactor this function
  toString() {
    let string = `relationship ${this.type} {\n  `;
    if (this.commentInFrom) {
      string += `/**\n${this.commentInFrom
        .split('\n')
        .map(line => `   * ${line}\n`)
        .join('')}   */\n  `;
    }
    const sourceOptions = this.options.source;
    if (Object.keys(sourceOptions).length !== 0) {
      Object.keys(sourceOptions).forEach(name => {
        const value = sourceOptions[name];
        string += `  @${name}${value != null && sourceOptions[name] !== true ? `(${value})` : ''}\n`;
      });
      string += '  ';
    }
    string += `${this.from}`;
    if (this.injectedFieldInFrom) {
      string += `{${this.injectedFieldInFrom}${this.isInjectedFieldInFromRequired ? ` ${REQUIRED}` : ''}}`;
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
    const destinationOptions = this.options.destination;
    if (Object.keys(destinationOptions).length !== 0) {
      string += '\n';
      Object.keys(destinationOptions).forEach(name => {
        const value = destinationOptions[name];
        string += `  @${name}${value != null && destinationOptions[name] !== true ? `(${value})` : ''}\n`;
      });
      string += '  ';
    }
    string += `${this.to}`;
    if (this.injectedFieldInTo) {
      string += `{${this.injectedFieldInTo}${this.isInjectedFieldInToRequired ? ` ${REQUIRED}` : ''}}`;
    }
    const globalOptions = this.options.global;
    if (Object.keys(globalOptions).length !== 0) {
      string += ' with ';
      Object.keys(globalOptions).forEach(name => {
        string += `${name}, `;
      });
      string = string.substring(0, string.length - 2);
    }
    string += '\n}';
    return string.replace(/ \n/g, '\n').replace(/[ ]{4}/g, '  ');
  }
}

function mergeDefaultsWithOverrides(overrides) {
  const defaultOptions = defaults();
  if (!overrides || Object.keys(overrides).length === 0) {
    return defaultOptions;
  }
  const mergedOptions = {
    ...defaultOptions,
    ...overrides,
  };
  mergedOptions.options.global = mergedOptions.options.global || {};
  mergedOptions.options.source = mergedOptions.options.source || {};
  mergedOptions.options.destination = mergedOptions.options.destination || {};
  return mergedOptions;
}

function defaults() {
  return {
    type: relationshipTypes.ONE_TO_ONE,
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    isInjectedFieldInFromRequired: false,
    isInjectedFieldInToRequired: false,
    options: {
      global: {},
      destination: {},
      source: {},
    },
    commentInFrom: '',
    commentInTo: '',
    unidirectionalRelationships: false,
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
