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

/**
 * get hibernate SnakeCase in JHipster preferred style.
 *
 * @param {string} value - table column name or table name string
 * @see org.springframework.boot.hibernateSpringNamingStrategy
 * @returns hibernate SnakeCase in JHipster preferred style
 */

export function hibernateSnakeCase(value: string): string {
  let res = '';
  if (value) {
    if (value.length === 1) {
      return value.toLowerCase();
    }
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
