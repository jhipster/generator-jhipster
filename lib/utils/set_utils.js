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

module.exports = {
  addAll,
  join,
  filter
};

function addAll(set, elements) {
  if (!set) {
    throw new Error('A Set must be passed so as to insert elements.');
  }
  if (!elements || elements.length === 0) {
    return set;
  }
  elements.forEach(element => set.add(element));
  return set;
}

function join(set, separator = ',') {
  if (!set) {
    throw new Error('A Set must be passed so as to join elements.');
  }
  return Array.from(set).join(separator);
}

function filter(set, passedFunction) {
  if (!set) {
    throw new Error('A Set must be passed so as to filter elements.');
  }
  if (!passedFunction) {
    throw new Error('The function must not be nil to filter the set.');
  }
  return new Set(Array.from(set).filter(passedFunction));
}
