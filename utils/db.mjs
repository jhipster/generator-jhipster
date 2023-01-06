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

import crypto from 'crypto';

/**
 * get hibernate SnakeCase in JHipster preferred style.
 *
 * @param {string} value - table column name or table name string
 * @see org.springframework.boot.orm.jpa.hibernate.SpringNamingStrategy
 * @returns hibernate SnakeCase in JHipster preferred style
 */
export function hibernateSnakeCase(value) {
  let res = '';
  if (value) {
    value = value.replace('.', '_');
    res = value[0];
    for (let i = 1, len = value.length - 1; i < len; i++) {
      if (
        value[i - 1] !== value[i - 1].toUpperCase() &&
        value[i] !== value[i].toLowerCase() &&
        value[i + 1] !== value[i + 1].toUpperCase()
      ) {
        res += `_${value[i]}`;
      } else {
        res += value[i];
      }
    }
    res += value[value.length - 1];
    res = res.toLowerCase();
  }
  return res;
}

/**
 * get for tables/constraints in JHipster preferred style after applying any length limits required.
 *
 * @param {string} tableOrEntityName - name of the table or entity
 * @param {string} columnOrRelationshipName - name of the column or relationship
 * @param {number} limit - max length of the returned db reference name
 * @param {object} [options]
 * @param {boolean} [options.noSnakeCase = false] - do not convert names to snakecase
 * @param {string} [options.prefix = '']
 * @param {string} [options.separator = '__']
 * @param {boolean} [options.appendHash = true] - adds a calculated hash based on tableOrEntityName and columnOrRelationshipName to prevent trimming conflict.
 * @return {string} db referente name
 */
export function calculateDbNameWithLimit(tableOrEntityName, columnOrRelationshipName, limit, options = {}) {
  const { noSnakeCase = false, prefix = '', separator = '__', appendHash = true } = options;
  const halfLimit = Math.floor(limit / 2);
  const suffix = !appendHash
    ? ''
    : `_${crypto
        .createHash('shake256', { outputLength: 1 })
        .update(`${tableOrEntityName}.${columnOrRelationshipName}`, 'utf8')
        .digest('hex')}`;

  let formattedName = noSnakeCase ? tableOrEntityName : hibernateSnakeCase(tableOrEntityName);
  formattedName = formattedName.substring(0, halfLimit - (!appendHash ? 0 : separator.length));

  let otherFormattedName = noSnakeCase ? columnOrRelationshipName : hibernateSnakeCase(columnOrRelationshipName);
  otherFormattedName = otherFormattedName.substring(0, limit - formattedName.length - separator.length - prefix.length - suffix.length);

  return `${prefix}${formattedName}${separator}${otherFormattedName}${suffix}`;
}
