/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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
const REACT_DIR = constants.ANGULAR_DIR;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const files = {
    common: [
        {
            templates: [
                '.prettierrc', // this needs to be the first file for prettier transform to work
                '.prettierignore',
                'package.json',
                'tslint.json',
                'tsconfig.json',
                'tsconfig.test.json',
                { file: '.editorconfig', method: 'copy', noEjs: true },
                'webpack/logo-jhipster.png',
                'webpack/webpack.common.js',
                'webpack/webpack.dev.js',
                'webpack/webpack.prod.js',
                'webpack/utils.js'
            ]
        },
        {
            condition: generator => generator.protractorTests,
            templates: ['tsconfig.e2e.json']
        },
        {
            condition: generator => !generator.skipCommitHook,
            templates: ['.huskyrc']
        }
    ],
    sass: [
        {
            condition: generator => generator.useSass,
            templates: ['postcss.config.js']
        },
        {
            condition: generator => generator.useSass && generator.enableI18nRTL,
            path: MAIN_SRC_DIR,
            templates: ['app/rtl.scss']
        }
    ],
    image: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'static/images/hipster.png', method: 'copy' },
                { file: 'static/images/hipster2x.png', method: 'copy' },
                { file: 'static/images/hipster192.png', method: 'copy' },
                { file: 'static/images/hipster256.png', method: 'copy' },
                { file: 'static/images/hipster384.png', method: 'copy' },
                { file: 'static/images/hipster512.png', method: 'copy' },
                { file: 'static/images/logo-jhipster.png', method: 'copy' },
                { file: 'static/images/logo-jhipster-react.svg', method: 'copy' }
            ]
        }
    ],
    swagger: [
        {
            path: MAIN_SRC_DIR,
            templates: ['swagger-ui/index.html', { file: 'swagger-ui/dist/images/throbber.gif', method: 'copy' }]
        }
    ],
    commonWeb: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'favicon.ico', method: 'copy' },
                'robots.txt',
                '404.html',
                'index.html',
                'manifest.webapp',
                'static/css/loading.css'
            ]
        }
    ],
    reactApp: [
        {
            path: REACT_DIR,
            templates: [
                { file: 'app.tsx', method: 'processJsx' },
                { file: 'index.tsx', method: 'processJsx' },
                { file: 'routes.tsx', method: 'processJsx' },
                'typings.d.ts',
                'config/constants.ts',
                'config/axios-interceptor.ts',
                { file: 'config/devtools.tsx', method: 'processJsx' },
                'config/error-middleware.ts',
                'config/logger-middleware.ts',
                'config/notification-middleware.ts',
                'config/store.ts',
                'config/icon-loader.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: REACT_DIR,
            templates: ['config/translation.ts']
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: REACT_DIR,
            templates: ['config/websocket-middleware.ts']
        },
        {
            condition: generator => generator.useSass,
            path: REACT_DIR,
            templates: ['app.scss', '_bootstrap-variables.scss']
        },
        {
            condition: generator => !generator.useSass,
            path: REACT_DIR,
            templates: ['app.css']
        },
        {
            condition: generator => !generator.useSass && generator.enableI18nRTL,
            path: MAIN_SRC_DIR,
            templates: ['app/rtl.css']
        }
        // {
        //   condition: generator => generator.authenticationType === 'oauth2' || generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
        //   path: REACT_DIR,
        //   templates: [
        //     'blocks/interceptor/_auth.interceptor.js'
        //   ]
        // },
        // {
        //   condition: generator => !generator.skipServer,
        //   path: REACT_DIR,
        //   templates: [
        //     'blocks/interceptor/_auth-expired.interceptor.js'
        //   ]
        // }
    ],
    reactEntities: [
        {
            path: REACT_DIR,
            templates: [{ file: 'entities/index.tsx', method: 'processJsx' }]
        }
    ],
    reactMain: [
        {
            path: REACT_DIR,
            templates: [{ file: 'modules/home/home.tsx', method: 'processJsx' }, { file: 'modules/login/logout.tsx', method: 'processJsx' }]
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: REACT_DIR,
            templates: [
                { file: 'modules/login/login.tsx', method: 'processJsx' },
                { file: 'modules/login/login-modal.tsx', method: 'processJsx' }
            ]
        },
        {
            condition: generator => generator.useSass,
            path: REACT_DIR,
            templates: ['modules/home/home.scss']
        },
        {
            condition: generator => !generator.useSass,
            path: REACT_DIR,
            templates: ['modules/home/home.css']
        }
    ],
    reducers: [
        {
            path: REACT_DIR,
            templates: [
                'shared/reducers/index.ts',
                'shared/reducers/action-type.util.ts',
                'shared/reducers/authentication.ts',
                'shared/reducers/application-profile.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: REACT_DIR,
            templates: ['shared/reducers/locale.ts']
        },
        {
            condition: generator => generator.authenticationType === 'oauth2',
            path: REACT_DIR,
            templates: ['shared/reducers/user-management.ts']
        }
    ],
    accountModule: [
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: REACT_DIR,
            templates: [
                { file: 'modules/account/index.tsx', method: 'processJsx' },
                { file: 'modules/account/activate/activate.tsx', method: 'processJsx' },
                { file: 'modules/account/password/password.tsx', method: 'processJsx' },
                { file: 'modules/account/register/register.tsx', method: 'processJsx' },
                { file: 'modules/account/password-reset/init/password-reset-init.tsx', method: 'processJsx' },
                { file: 'modules/account/password-reset/finish/password-reset-finish.tsx', method: 'processJsx' },
                { file: 'modules/account/settings/settings.tsx', method: 'processJsx' },
                { file: 'modules/account/register/register.reducer.ts', method: 'processJsx' },
                { file: 'modules/account/activate/activate.reducer.ts', method: 'processJsx' },
                { file: 'modules/account/password-reset/password-reset.reducer.ts', method: 'processJsx' },
                { file: 'modules/account/password/password.reducer.ts', method: 'processJsx' },
                { file: 'modules/account/settings/settings.reducer.ts', method: 'processJsx' }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: REACT_DIR,
            templates: [
                { file: 'modules/account/sessions/sessions.tsx', method: 'processJsx' },
                'modules/account/sessions/sessions.reducer.ts'
            ]
        }
    ],
    adminModule: [
        {
            path: REACT_DIR,
            templates: [
                // admin modules
                { file: 'modules/administration/index.tsx', method: 'processJsx' },
                { file: 'modules/administration/audits/audits.tsx', method: 'processJsx' },
                { file: 'modules/administration/configuration/configuration.tsx', method: 'processJsx' },
                { file: 'modules/administration/docs/docs.tsx', method: 'processJsx' },
                { file: 'modules/administration/health/health.tsx', method: 'processJsx' },
                { file: 'modules/administration/health/health-modal.tsx', method: 'processJsx' },
                { file: 'modules/administration/logs/logs.tsx', method: 'processJsx' },
                { file: 'modules/administration/metrics/metrics.tsx', method: 'processJsx' },
                { file: 'modules/administration/metrics/metrics-modal.tsx', method: 'processJsx' },
                { file: 'modules/administration/metrics/thread-item.tsx', method: 'processJsx' },
                'modules/administration/administration.reducer.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: REACT_DIR,
            templates: [{ file: 'modules/administration/tracker/tracker.tsx', method: 'processJsx' }]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: REACT_DIR,
            templates: [
                { file: 'modules/administration/user-management/index.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management-update.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management-detail.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management-delete-dialog.tsx', method: 'processJsx' },
                'modules/administration/user-management/user-management.reducer.ts'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: REACT_DIR,
            templates: [{ file: 'modules/administration/gateway/gateway.tsx', method: 'processJsx' }]
        }
    ],
    reactShared: [
        {
            path: REACT_DIR,
            templates: [
                // layouts
                { file: 'shared/layout/footer/footer.tsx', method: 'processJsx' },
                { file: 'shared/layout/header/header.tsx', method: 'processJsx' },
                { file: 'shared/layout/header/header-components.tsx', method: 'processJsx' },
                'shared/layout/header/menus/index.ts',
                { file: 'shared/layout/header/menus/admin.tsx', method: 'processJsx' },
                { file: 'shared/layout/header/menus/account.tsx', method: 'processJsx' },
                { file: 'shared/layout/header/menus/entities.tsx', method: 'processJsx' },
                { file: 'shared/layout/password/password-strength-bar.tsx', method: 'processJsx' },
                // util
                'shared/util/date-utils.ts',
                'shared/util/pagination.constants.ts',
                'shared/util/url-utils.ts',
                'shared/util/entity-utils.ts',
                // components
                { file: 'shared/auth/private-route.tsx', method: 'processJsx' },
                { file: 'shared/error/error-boundary.tsx', method: 'processJsx' },
                { file: 'shared/error/error-boundary-route.tsx', method: 'processJsx' },
                // model
                'shared/model/user.model.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: REACT_DIR,
            templates: [{ file: 'shared/layout/header/menus/locale.tsx', method: 'processJsx' }]
        },
        {
            condition: generator => generator.authenticationType === 'oauth2',
            path: REACT_DIR,
            templates: ['shared/util/url-utils.ts']
        },
        {
            condition: generator => generator.authenticationType === 'session' && generator.websocket === 'spring-websocket',
            path: REACT_DIR,
            templates: ['shared/util/cookie-utils.ts']
        },
        {
            condition: generator => generator.useSass,
            path: REACT_DIR,
            templates: [
                'shared/layout/header/header.scss',
                'shared/layout/footer/footer.scss',
                'shared/layout/password/password-strength-bar.scss'
            ]
        },
        {
            condition: generator => !generator.useSass,
            path: REACT_DIR,
            templates: [
                'shared/layout/header/header.css',
                'shared/layout/footer/footer.css',
                'shared/layout/password/password-strength-bar.css'
            ]
        }
    ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
                'jest.conf.js',
                'spec/enzyme-setup.ts',
                'spec/storage-mock.ts',
                'spec/app/utils.ts',
                'spec/app/config/axios-interceptor.spec.ts',
                'spec/app/config/notification-middleware.spec.ts',
                'spec/app/shared/reducers/application-profile.spec.ts',
                'spec/app/shared/reducers/authentication.spec.ts',
                'spec/app/shared/util/entity-utils.spec.ts',
                'spec/app/shared/auth/private-route.spec.tsx',
                'spec/app/shared/error/error-boundary.spec.tsx',
                'spec/app/shared/error/error-boundary-route.spec.tsx',
                'spec/app/shared/layout/header/header.spec.tsx',
                'spec/app/shared/layout/header/menus/account.spec.tsx',
                'spec/app/modules/administration/administration.reducer.spec.ts'
                // 'spec/app/account/activate/_activate.component.spec.js',
                // 'spec/app/account/password/_password.component.spec.js',
                // 'spec/app/account/password/_password-strength-bar.component.spec.js',
                // 'spec/app/account/password-reset/init/_password-reset-init.component.spec.js',
                // 'spec/app/account/password-reset/finish/_password-reset-finish.component.spec.js',
                // 'spec/app/account/settings/_settings.component.spec.js',
                // 'spec/app/admin/health/_health.component.spec.js',
                // 'spec/app/admin/audits/_audits.component.spec.js',
                // 'spec/helpers/_spyobject.js',
                // 'spec/helpers/_mock-account.service.js',
                // 'spec/helpers/_mock-principal.service.js',
                // 'spec/helpers/_mock-route.service.js'
            ]
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: TEST_SRC_DIR,
            templates: [
                // 'spec/app/modules/account/register/register.spec.tsx',
                'spec/app/modules/account/register/register.reducer.spec.ts',
                'spec/app/modules/account/activate/activate.reducer.spec.ts',
                'spec/app/modules/account/password/password.reducer.spec.ts',
                'spec/app/modules/account/settings/settings.reducer.spec.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: ['spec/app/modules/administration/user-management/user-management.reducer.spec.ts']
        },
        {
            condition: generator => generator.enableTranslation,
            path: TEST_SRC_DIR,
            templates: ['spec/app/shared/reducers/locale.spec.ts']
        },
        {
            condition: generator => generator.skipUserManagement && generator.authenticationType === 'oauth2',
            path: TEST_SRC_DIR,
            templates: ['spec/app/shared/reducers/user-management.spec.ts']
        },
        // {
        //     condition: generator => generator.authenticationType === 'session',
        //     path: TEST_SRC_DIR,
        //     templates: [
        //         'spec/app/modules/account/sessions/sessions.reducer.spec.ts',
        //     ]
        // },
        {
            condition: generator => generator.protractorTests,
            path: TEST_SRC_DIR,
            templates: [
                'e2e/modules/account/account.spec.ts',
                'e2e/modules/administration/administration.spec.ts',
                'e2e/util/utils.ts',
                'e2e/page-objects/base-component.ts',
                'e2e/page-objects/navbar-page.ts',
                'e2e/page-objects/signin-page.ts',
                'protractor.conf.js'
            ]
        },
        {
            condition: generator => generator.protractorTests && generator.authenticationType !== 'oauth2',
            path: TEST_SRC_DIR,
            templates: ['e2e/page-objects/password-page.ts', 'e2e/page-objects/settings-page.ts', 'e2e/page-objects/register-page.ts']
        }
    ]
};

module.exports = {
    writeFiles,
    files
};

function writeFiles() {
    mkdirp(MAIN_SRC_DIR);
    // write React files
    this.writeFilesToDisk(files, this, false, this.fetchFromInstalledJHipster('client/templates/react'));
}
