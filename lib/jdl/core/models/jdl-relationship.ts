/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { upperFirst } from 'lodash-es';

import { relationshipTypeExists } from '../basic-types/relationship-types.ts';
import type { JDLRelationshipType, RelationshipSide } from '../basic-types/relationships.ts';
import { Validations } from '../built-in-options/index.ts';

const { REQUIRED } = Validations;

export type JDLRelationshipOptions = Record<'global' | 'source' | 'destination', Record<string, any>>;

export type JDLSourceEntitySide = {
  sourceEntity: string;
  injectedFieldInSourceEntity?: string;
  injectedFieldInSourceIsRequired: boolean;
  commentForSourceEntity?: string;
};

export type JDLRelationshipModel = {
  side?: RelationshipSide;
  from: string;
  to: string;
  type: JDLRelationshipType;
  options: JDLRelationshipOptions;
  injectedFieldInFrom?: string | null;
  injectedFieldInTo?: string | null;
  isInjectedFieldInFromRequired: boolean;
  isInjectedFieldInToRequired: boolean;
  commentInFrom?: string | null;
  commentInTo?: string | null;
};

export default class JDLRelationship implements JDLRelationshipModel {
  side?: RelationshipSide;
  from: string;
  to: string;
  type: JDLRelationshipType;
  options: { global: Record<string, any>; source: Record<string, any>; destination: Record<string, any> };
  injectedFieldInFrom?: string | null;
  injectedFieldInTo?: string | null;
  isInjectedFieldInFromRequired: boolean;
  isInjectedFieldInToRequired: boolean;
  commentInFrom?: string | null;
  commentInTo?: string | null;

  constructor(args: Partial<JDLRelationshipModel> & Pick<JDLRelationshipModel, 'from' | 'to' | 'type'>) {
    const merged = mergeDefaultsWithOverrides(args);
    if (!merged.from || !merged.to) {
      throw new Error('Source and destination entities must be passed to create a relationship.');
    }
    if (!relationshipTypeExists(merged.type) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
      throw new Error('A valid type and at least one injected field must be passed to create a relationship.');
    }
    this.side = merged.side;
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

  hasGlobalOption(option: string) {
    return option in this.options.global;
  }

  forEachGlobalOption(passedFunction: (optionName: string, value: any) => void) {
    Object.entries(this.options.global).forEach(([key, value]) => {
      passedFunction(key, value);
    });
  }

  forEachSourceOption(passedFunction: (optionName: string, value: any) => void) {
    Object.entries(this.options.source).forEach(([key, value]) => {
      passedFunction(key, value);
    });
  }

  forEachDestinationOption(passedFunction: (optionName: string, value: any) => void) {
    Object.entries(this.options.destination).forEach(([key, value]) => {
      passedFunction(key, value);
    });
  }

  toString() {
    let string = `relationship ${this.type} {\n  `;

    if (this.commentInFrom) {
      string += this.formatComment(this.commentInFrom);
    }

    string += this.formatOptions(this.options.source);

    string += this.formatEntityWithField(this.from, this.injectedFieldInFrom, this.isInjectedFieldInFromRequired);

    string += ' to';

    if (this.commentInTo) {
      string += `\n  ${this.formatComment(this.commentInTo)}`;
    } else {
      string += ' ';
    }

    string += this.formatOptions(this.options.destination);

    string += this.formatEntityWithField(this.to, this.injectedFieldInTo, this.isInjectedFieldInToRequired);

    string += this.formatGlobalOptions();

    string += '\n}';

    return string.replace(/ \n/g, '\n').replace(/[ ]{4}/g, '  ');
  }

  private formatComment(comment: string | null | undefined): string {
    if (!comment) {
      return '';
    }
    return `/**\n${comment
      .split('\n')
      .map(line => `   * ${line}\n`)
      .join('')}   */\n  `;
  }

  private formatOptions(options: Record<string, any>): string {
    if (Object.keys(options).length === 0) {
      return '';
    }
    return Object.keys(options)
      .map(name => {
        const value = options[name];
        const capitalizedName = upperFirst(name);
        return `@${capitalizedName}${value != null && value !== true ? `(${value}) ` : ' '}`;
      })
      .join('');
  }

  private formatGlobalOptions(): string {
    const globalOptions = this.options.global;
    if (Object.keys(globalOptions).length === 0) {
      return '';
    }
    const optionsString = Object.keys(globalOptions).join(', ');
    return ` with ${optionsString}`;
  }

  private formatEntityWithField(entityName: string, injectedField: string | null | undefined, isRequired: boolean): string {
    let result = entityName;
    if (injectedField) {
      result += `{${injectedField}${isRequired ? ` ${REQUIRED}` : ''}}`;
    }
    return result;
  }
}

function mergeDefaultsWithOverrides(
  overrides: Partial<JDLRelationshipModel> & Pick<JDLRelationshipModel, 'from' | 'to' | 'type'>,
): JDLRelationshipModel {
  const defaultOptions = defaults();
  const mergedOptions = {
    ...defaultOptions,
    ...overrides,
  };
  mergedOptions.options.global = mergedOptions.options.global || {};
  mergedOptions.options.source = mergedOptions.options.source || {};
  mergedOptions.options.destination = mergedOptions.options.destination || {};
  return mergedOptions;
}

function defaults(): Omit<JDLRelationshipModel, 'from' | 'to' | 'type'> {
  return {
    side: undefined,
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
  };
}
