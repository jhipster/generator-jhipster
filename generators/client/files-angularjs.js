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
const mkdirp = require('mkdirp');
const constants = require('../generator-constants');

/* Constants use throughout */
const MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const ANGULAR_DIR = constants.ANGULAR_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
*/
const files = {
    common: [
        {
            templates: [
                '_package.json',
                '_bower.json',
                '_.bowerrc',
                '_.eslintrc.json',
                '_.eslintignore',
                '_gulpfile.js',
                'gulp/_utils.js',
                'gulp/_serve.js',
                'gulp/_config.js',
                'gulp/_build.js',
                'gulp/_copy.js',
                'gulp/_inject.js'
            ]
        }
    ],
    css: [
        // this css file will be overwritten by the sass generated css if sass is enabled
        // but this will avoid errors when running app without running sass task first
        {
            path: MAIN_SRC_DIR,
            templates: [
                'content/css/_main.css',
                'content/css/_documentation.css'
            ]
        }
    ],
    sass: [
        {
            condition: generator => generator.useSass,
            path: MAIN_SRC_DIR,
            templates: [
                'scss/_main.scss',
                'scss/_vendor.scss'
            ]
        }
    ],
    image: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'content/images/_hipster.png', method: 'copy' },
                { file: 'content/images/_hipster2x.png', method: 'copy' },
                { file: 'content/images/_logo-jhipster.png', method: 'copy' }
            ]
        }
    ],
    swagger: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                'swagger-ui/_index.html',
                { file: 'swagger-ui/images/_throbber.gif', method: 'copy' }
            ]
        }
    ],
    commonWeb: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: '_favicon.ico', method: 'copy' },
                '_robots.txt',
                '_404.html',
                '_index.html',
                '_manifest.webapp'
            ]
        }
    ],
    angularApp: [
        {
            path: ANGULAR_DIR,
            templates: [
                '_app.module.js',
                '_app.state.js',
                '_app.constants.js',
                'blocks/handlers/_state.handler.js',
                'blocks/config/_alert.config.js',
                'blocks/config/_http.config.js',
                'blocks/config/_localstorage.config.js',
                'blocks/config/_compile.config.js',
                'blocks/config/_uib-pager.config.js',
                'blocks/config/_uib-pagination.config.js',
                'blocks/interceptor/_auth-expired.interceptor.js',
                'blocks/interceptor/_errorhandler.interceptor.js',
                'blocks/interceptor/_notification.interceptor.js'

            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'blocks/handlers/_translation.handler.js',
                'blocks/config/_translation.config.js',
                'blocks/config/_translation-storage.provider.js'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'oauth2' || generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
            path: ANGULAR_DIR,
            templates: [
                'blocks/interceptor/_auth.interceptor.js'
            ]
        }
    ],
    angularMain: [
        {
            path: ANGULAR_DIR,
            templates: [
                // entities
                'entities/_entity.state.js',
                // home module
                'home/_home.controller.js',
                { file: 'home/_home.state.js', method: 'processJs' },
                { file: 'home/_home.html', method: 'processHtml' },
                // layouts
                'layouts/navbar/_navbar.controller.js',
                'services/profiles/_profile.service.js',
                'services/profiles/_page-ribbon.directive.js',
                { file: 'layouts/navbar/_navbar.html', method: 'processHtml' },
                { file: 'layouts/error/_error.html', method: 'processHtml' },
                { file: 'layouts/error/_accessdenied.html', method: 'processHtml' },
                { file: 'layouts/error/_error.state.js', method: 'processJs' }
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'layouts/navbar/_active-menu.directive.js'
            ]
        }
    ],
    angularAccountModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                'account/_account.state.js',
                'account/activate/_activate.controller.js',
                { file: 'account/activate/_activate.state.js', method: 'processJs' },
                { file: 'account/activate/_activate.html', method: 'processHtml' },
                'account/password/_password.controller.js',
                { file: 'account/password/_password.state.js', method: 'processJs' },
                'account/password/_password-strength-bar.directive.js',
                { file: 'account/password/_password.html', method: 'processHtml' },
                'account/register/_register.controller.js',
                { file: 'account/register/_register.state.js', method: 'processJs' },
                { file: 'account/register/_register.html', method: 'processHtml' },
                'account/reset/request/_reset.request.controller.js',
                { file: 'account/reset/request/_reset.request.state.js', method: 'processJs' },
                { file: 'account/reset/request/_reset.request.html', method: 'processHtml' },
                'account/reset/finish/_reset.finish.controller.js',
                { file: 'account/reset/finish/_reset.finish.html', method: 'processHtml' },
                { file: 'account/reset/finish/_reset.finish.state.js', method: 'processJs' },
                'account/settings/_settings.controller.js',
                { file: 'account/settings/_settings.state.js', method: 'processJs' },
                { file: 'account/settings/_settings.html', method: 'processHtml' }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/sessions/_sessions.state.js', method: 'processJs' },
                { file: 'account/sessions/_sessions.html', method: 'processHtml' },
                'account/sessions/_sessions.controller.js'
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn,
            path: ANGULAR_DIR,
            templates: [
                { file: 'account/social/directive/_social.html', method: 'processHtml' },
                { file: 'account/social/_social-register.html', method: 'processHtml' },
                'account/social/directive/_social.directive.js',
                'account/social/_social-register.controller.js',
                'account/social/_social.service.js',
                { file: 'account/social/_social.state.js', method: 'processJs' }
            ]
        },
        {
            condition: generator => generator.enableSocialSignIn && generator.authenticationType === 'jwt',
            path: ANGULAR_DIR,
            templates: [
                'account/social/_social-auth.controller.js'
            ]
        }
    ],
    angularAdminModule: [
        {
            path: ANGULAR_DIR,
            templates: [
                'admin/_admin.state.js',
                'admin/configuration/_configuration.controller.js',
                'admin/configuration/_configuration.service.js',
                { file: 'admin/configuration/_configuration.state.js', method: 'processJs' },
                { file: 'admin/configuration/_configuration.html', method: 'processHtml' },
                'admin/health/_health.controller.js',
                'admin/health/_health.modal.controller.js',
                'admin/health/_health.service.js',
                { file: 'admin/health/_health.state.js', method: 'processJs' },
                { file: 'admin/health/_health.html', method: 'processHtml' },
                { file: 'admin/health/_health.modal.html', method: 'processHtml' },
                'admin/logs/_logs.controller.js',
                'admin/logs/_logs.service.js',
                { file: 'admin/logs/_logs.state.js', method: 'processJs' },
                { file: 'admin/logs/_logs.html', method: 'processHtml' },
                'admin/metrics/_metrics.controller.js',
                'admin/metrics/_metrics.modal.controller.js',
                'admin/metrics/_metrics.service.js',
                { file: 'admin/metrics/_metrics.state.js', method: 'processJs' },
                { file: 'admin/metrics/_metrics.html', method: 'processHtml', template: true },
                { file: 'admin/metrics/_metrics.modal.html', method: 'processHtml', template: true },
                'admin/docs/_docs.html',
                { file: 'admin/docs/_docs.state.js', method: 'processJs' }
            ]
        },
        {
            condition: generator => (generator.databaseType !== 'no' && generator.databaseType !== 'cassandra'),
            path: ANGULAR_DIR,
            templates: [
                'admin/audits/_audits.controller.js',
                'admin/audits/_audits.service.js',
                { file: 'admin/audits/_audits.state.js', method: 'processJs' },
                { file: 'admin/audits/_audits.html', method: 'processHtml' },
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/tracker/_tracker.html', method: 'processHtml' },
                { file: 'admin/tracker/_tracker.state.js', method: 'processJs' },
                'admin/tracker/_tracker.controller.js',
                'admin/tracker/_tracker.service.js'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: ANGULAR_DIR,
            templates: [
                { file: 'admin/user-management/_user-management.html', method: 'processHtml' },
                { file: 'admin/user-management/_user-management-detail.html', method: 'processHtml' },
                { file: 'admin/user-management/_user-management-dialog.html', method: 'processHtml' },
                { file: 'admin/user-management/_user-management-delete-dialog.html', method: 'processHtml' },
                { file: 'admin/user-management/_user-management.state.js', method: 'processJs' },
                'admin/user-management/_user-management.controller.js',
                'admin/user-management/_user-management-detail.controller.js',
                'admin/user-management/_user-management-dialog.controller.js',
                'admin/user-management/_user-management-delete-dialog.controller.js'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway',
            path: ANGULAR_DIR,
            templates: [
                'admin/gateway/_gateway.controller.js',
                'admin/gateway/_gateway-routes.service.js',
                { file: 'admin/gateway/_gateway.state.js', method: 'processJs' },
                { file: 'admin/gateway/_gateway.html', method: 'processHtml' }
            ]
        }
    ],
    angularSharedComponents: [
        {
            path: ANGULAR_DIR,
            templates: [
                { file: 'components/login/_login.html', method: 'processHtml' },
                { file: 'components/login/_login.service.js', method: 'processJs' },
                'components/login/_login.controller.js',
                'components/form/_show-validation.directive.js',
                'components/form/_maxbytes.directive.js',
                'components/form/_minbytes.directive.js',
                'components/form/_pagination.constants.js',
                'components/util/_base64.service.js',
                'components/util/_capitalize.filter.js',
                'components/util/_error.constants.js',
                'components/util/_parse-links.service.js',
                'components/util/_truncate-characters.filter.js',
                'components/util/_truncate-words.filter.js',
                'components/util/_date-util.service.js',
                'components/util/_data-util.service.js',
                'components/util/_pagination-util.service.js',
                'components/util/_sort.directive.js',
                'components/util/_sort-by.directive.js',
                'components/util/_jhi-item-count.directive.js',
                // alert service code
                'components/alert/_alert.service.js',
                'components/alert/_alert.directive.js',
                'components/alert/_alert-error.directive.js'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: ANGULAR_DIR,
            templates: [
                'components/language/_language.filter.js',
                'components/language/_language.constants.js',
                'components/language/_language.controller.js',
                'components/language/_language.service.js',
            ]
        }
    ],
    angularAuthService: [
        {
            path: ANGULAR_DIR,
            templates: [
                'services/auth/_auth.service.js',
                'services/auth/_principal.service.js',
                'services/auth/_has-authority.directive.js',
                'services/auth/_has-any-authority.directive.js',
                'services/auth/_account.service.js',
                'services/auth/_activate.service.js',
                'services/auth/_password.service.js',
                'services/auth/_password-reset-init.service.js',
                'services/auth/_password-reset-finish.service.js',
                'services/auth/_register.service.js',
                'services/user/_user.service.js'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
            path: ANGULAR_DIR,
            templates: [
                'services/auth/_auth.jwt.service.js'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: ANGULAR_DIR,
            templates: [
                'services/auth/_auth.session.service.js',
                'services/auth/_sessions.service.js'
            ]
        }
    ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
                '_karma.conf.js',
                'spec/helpers/_module.js',
                'spec/helpers/_httpBackend.js',
                'spec/app/admin/health/_health.controller.spec.js',
                'spec/app/account/password/_password.controller.spec.js',
                'spec/app/account/password/_password-strength-bar.directive.spec.js',
                'spec/app/account/settings/_settings.controller.spec.js',
                'spec/app/account/activate/_activate.controller.spec.js',
                'spec/app/account/register/_register.controller.spec.js',
                'spec/app/account/reset/finish/_reset.finish.controller.spec.js',
                'spec/app/account/reset/request/_reset.request.controller.spec.js',
                'spec/app/services/auth/_auth.services.spec.js',
                'spec/app/components/login/_login.controller.spec.js'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/sessions/_sessions.controller.spec.js'
            ]
        },
        {
            condition: generator => generator.protractorTests,
            path: TEST_SRC_DIR,
            templates: [
                'e2e/account/_account.js',
                'e2e/admin/_administration.js',
                '_protractor.conf.js'
            ]
        }
    ]
};

module.exports = {
    writeFiles,
    files
};


function writeFiles() {
    mkdirp(MAIN_SRC_DIR);
    this.copy('angularjs/gulp/_handle-errors.js', 'gulp/handle-errors.js'); // to avoid interpolate errors
    // write angular 1.x files
    this.writeFilesToDisk(files, this, false, 'angularjs');
}
