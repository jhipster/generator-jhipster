/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const AbstractJDLOption = require('./abstract-jdl-option');
const { join } = require('../utils/set-utils');

/**
 * For flags such as skipServer, skipClient, etc.
 */
class JDLUnaryOption extends AbstractJDLOption {
    getType() {
        return 'UNARY';
    }

    toString() {
        const entityNames = join(this.entityNames, ', ');
        entityNames.slice(1, entityNames.length - 1);
        const firstPart = `${this.name} ${entityNames}`;
        if (this.excludedNames.size === 0) {
            return firstPart;
        }
        const excludedNames = join(this.excludedNames, ', ');
        excludedNames.slice(1, this.excludedNames.length - 1);
        return `${firstPart} except ${excludedNames}`;
    }
}

module.exports = JDLUnaryOption;
