/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

const _ = require('lodash');

const RELATIONSHIP_TYPES = {
  ONE_TO_ONE: 'OneToOne',
  ONE_TO_MANY: 'OneToMany',
  MANY_TO_ONE: 'ManyToOne',
  MANY_TO_MANY: 'ManyToMany'
};

function exists(relationship) {
  return Object.keys(RELATIONSHIP_TYPES).map(key => RELATIONSHIP_TYPES[key]).includes(_.upperFirst(_.camelCase(relationship)));
}

module.exports = {
  RELATIONSHIP_TYPES,
  exists
};
