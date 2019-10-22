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

module.exports = {
    // This adds support for a `--from-cli` flag
    'from-cli': {
        desc: 'Indicates the command is run from JHipster CLI',
        type: Boolean,
        defaults: false
    },
    // This adds support for a `--skip-client` flag
    'skip-client': {
        desc: 'Skip the client-side application generation',
        type: Boolean,
        scope: 'storage'
    },

    // This adds support for a `--skip-server` flag
    'skip-server': {
        desc: 'Skip the server-side application generation',
        type: Boolean,
        scope: 'storage'
    },

    // This adds support for a `--skip-git` flag
    'skip-git': {
        desc: 'Skip the git initialization',
        type: Boolean,
        defaults: false
    },

    // This adds support for a `--skip-commit-hook` flag
    'skip-commit-hook': {
        desc: 'Skip adding husky commit hooks',
        type: Boolean,
        defaults: false
    },

    // This adds support for a `--skip-user-management` flag
    'skip-user-management': {
        desc: 'Skip the user management module during app generation',
        type: Boolean,
        scope: 'storage'
    },

    // This adds support for a `--skip-check-length-of-identifier` flag
    'skip-check-length-of-identifier': {
        desc: 'Skip check the length of the identifier, only for recent Oracle databases that support 30+ characters metadata',
        type: Boolean,
        scope: 'storage'
    },

    // This adds support for a `--with-entities` flag
    'with-entities': {
        desc: 'Regenerate the existing entities if any',
        type: Boolean,
        defaults: false
    },

    // This adds support for a `--skip-checks` flag
    'skip-checks': {
        desc: 'Check the status of the required tools',
        type: Boolean,
        defaults: false
    },

    // This adds support for a `--jhi-prefix` flag
    'jhi-prefix': {
        desc: 'Add prefix before services, controllers and states name',
        type: String,
        scope: 'storage'
    },

    // This adds support for a `--entity-suffix` flag
    'entity-suffix': {
        desc: 'Add suffix after entities name',
        type: String,
        scope: 'storage'
    },

    // This adds support for a `--dto-suffix` flag
    'dto-suffix': {
        desc: 'Add suffix after dtos name',
        type: String,
        scope: 'storage'
    },

    // This adds support for a `--yarn` flag
    yarn: {
        desc: 'Use yarn instead of npm',
        type: Boolean,
        defaults: false
    },

    // This adds support for a `--auth` flag
    'authentication-type': {
        alias: 'auth',
        desc: 'Provide authentication type for the application when skipping server side generation',
        type: String
    },

    // This adds support for a `--db` flag
    db: {
        desc: 'Provide DB name for the application when skipping server side generation',
        type: String
    },

    // This adds support for a `--uaa-base-name` flag
    'uaa-base-name': {
        desc: 'Provide the name of UAA server, when using --auth uaa and skipping server side generation',
        type: String,
        scope: 'storage'
    },

    // This adds support for a `--build` flag
    'build-tool': {
        alias: 'build',
        desc: 'Provide build tool for the application when skipping server side generation',
        type: String,
        scope: 'storage'
    },

    // This adds support for a `--websocket` flag
    websocket: {
        desc: 'Provide websocket option for the application when skipping server side generation',
        type: String,
        scope: 'storage'
    },

    // This adds support for a `--search-engine` flag
    'search-engine': {
        desc: 'Provide search engine for the application when skipping server side generation',
        type: String,
        scope: 'storage'
    },

    // NOTE: Deprecated!!! Use --blueprints instead
    blueprint: {
        desc: 'DEPRECATED: Specify a generator blueprint to use for the sub generators',
        type: String
    },
    // This adds support for a `--blueprints` flag which can be used to specify one or more blueprints to use for generation
    blueprints: {
        desc: 'A comma separated list of one or more generator blueprints to use for the sub generators, e.g. --blueprints kotlin,vuejs',
        type: String
    },

    // This adds support for a `--experimental` flag which can be used to enable experimental features
    experimental: {
        desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
        type: Boolean,
        defaults: false
    }
};
