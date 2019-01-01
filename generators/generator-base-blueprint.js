/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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
/* eslint-disable consistent-return */
const BaseGenerator = require('./generator-base');

/**
 * This is the base class for a generator that can be extended through a blueprint.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = class extends BaseGenerator {
    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _configuring() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _install() {
        return {};
    }

    // Public API method used by the getter and also by Blueprints
    _end() {
        return {};
    }
};
