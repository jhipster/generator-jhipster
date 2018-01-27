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
                '_package.json',
                '_tslint.json',
                '_tsconfig.json',
                '.editorconfig',
                'webpack/logo-jhipster.png',
                'webpack/webpack.common.js',
                'webpack/webpack.dev.js',
                'webpack/webpack.prod.js',
                'webpack/webpack.test.js',
                'webpack/utils.js'
            ]
        }
    ],
    sass: [
        {
            condition: generator => generator.useSass,
            templates: [
                { file: '_postcss.config.js', method: 'copy' }
            ]
        }
    ],
    image: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'static/images/_hipster.png', method: 'copy' },
                { file: 'static/images/_hipster2x.png', method: 'copy' },
                { file: 'static/images/_logo-jhipster.png', method: 'copy' },
                { file: 'static/images/logo-jhipster-react.svg', method: 'copy' }
            ]
        }
    ],
    swagger: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                'swagger-ui/_index.html',
                { file: 'swagger-ui/dist/images/_throbber.gif', method: 'copy' }
            ]
        }
    ],
    commonWeb: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'favicon.ico', method: 'copy' },
                'robots.txt',
                '404.html',
                '_index.html',
                '_manifest.webapp'
            ]
        }
    ],
    reactApp: [
        {
            path: REACT_DIR,
            templates: [
                'app.tsx',
                'index.tsx',
                'routes.tsx',
                'typings.d.ts',
                'config/constants.ts',
                'config/axios-interceptor.ts',
                'config/devtools.tsx',
                'config/error-middleware.ts',
                'config/logger-middleware.ts',
                'config/notification-middleware.ts',
                'config/store.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: REACT_DIR,
            templates: [
                'config/translation.ts'
            ]
        },
        {
            condition: generator => generator.useSass,
            path: REACT_DIR,
            templates: [
                'app.scss',
                '__bootstrap-variables.scss',
            ]
        },
        {
            condition: generator => !generator.useSass,
            path: REACT_DIR,
            templates: [
                'app.css'
            ]
        },
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
            templates: [
                'entities/index.tsx'
            ]
        }
    ],
    reactMain: [
        {
            path: REACT_DIR,
            templates: [
                // home module
                { file: 'modules/home/home.tsx', method: 'processJsx' },
                // login module
                { file: 'modules/login/login.tsx', method: 'processJsx' },
                { file: 'modules/login/logout.tsx', method: 'processJsx' },
                { file: 'modules/login/login-modal.tsx', method: 'processJsx' }
            ]
        },
        {
            condition: generator => generator.useSass,
            path: REACT_DIR,
            templates: [
                'modules/home/home.scss',
            ]
        },
        {
            condition: generator => !generator.useSass,
            path: REACT_DIR,
            templates: [
                'modules/home/home.css',
            ]
        }
    ],
    reducers: [
        {
            path: REACT_DIR,
            templates: [
                // home module
                'reducers/index.ts',
                'reducers/action-type.util.ts',
                'reducers/administration.ts',
                'reducers/authentication.ts',
                'reducers/layout.ts',
                'reducers/user-management.ts',
                'reducers/account.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: REACT_DIR,
            templates: [
                'reducers/locale.ts'
            ]
        }
    ],
    accountModule: [
        {
            path: REACT_DIR,
            templates: [
                { file: 'modules/account/index.tsx', method: 'processJsx' },
                // { file: 'account/activate/_activate.component.js', method: 'processJsx' },
                { file: 'modules/account/password/password.tsx', method: 'processJsx' },
                // { file: 'account/register/_register.component.js', method: 'processJsx' },
                // { file: 'account/password-reset/init/_password-reset-init.component.js', method: 'processJsx' },
                // { file: 'account/password-reset/finish/_password-reset-finish.component.js', method: 'processJsx' },
                { file: 'modules/account/settings/settings.tsx', method: 'processJsx' }
                // { file: 'account/settings/_settings.component.js', method: 'processJsx' }
            ]
        }
    // {
    //   condition: generator => generator.authenticationType === 'session',
    //   path: REACT_DIR,
    //   templates: [
    //     'account/sessions/_session.model.js',
    //     { file: 'account/sessions/_sessions.component.js', method: 'processJsx' }
    //   ]
    // },
    // {
    //   condition: generator => generator.enableSocialSignIn,
    //   path: REACT_DIR,
    //   templates: [
    //             { file: 'account/social/_social-register.component.js', method: 'processJsx' },
    //             { file: 'shared/social/_social.component.js', method: 'processJsx' },
    //     'shared/social/_social.service.js'
    //   ]
    // },
    // {
    //   condition: generator => generator.enableSocialSignIn && generator.authenticationType === 'jwt',
    //   path: REACT_DIR,
    //   templates: [
    //             { file: 'account/social/_social-auth.component.js', method: 'processJsx' },
    //   ]
    // },
    // {
    //   condition: generator => generator.useSass,
    //   path: REACT_DIR,
    //   templates: [
    //     'account/password/_password-strength-bar.scss'
    //   ]
    // },
    // {
    //   condition: generator => !generator.useSass,
    //   path: REACT_DIR,
    //   templates: [
    //     'account/password/_password-strength-bar.css'
    //   ]
    // }
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
            ]
        },
        // {
        //   condition: generator => generator.websocket === 'spring-websocket',
        //   path: REACT_DIR,
        //   templates: [
        //     { file: 'modules/administration/tracker/Tracker.js', method: 'processJsx' }
        //   ]
        // },
        {
            condition: generator => !generator.skipUserManagement,
            path: REACT_DIR,
            templates: [
                { file: 'modules/administration/user-management/index.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management-dialog.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management-detail.tsx', method: 'processJsx' },
                { file: 'modules/administration/user-management/user-management-delete-dialog.tsx', method: 'processJsx' }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway',
            path: REACT_DIR,
            templates: [
                { file: 'modules/administration/gateway/gateway.tsx', method: 'processJsx' }
            ]
        }
    ],
    reactShared: [
        {
            path: REACT_DIR,
            templates: [
                // layouts
                'shared/layout/footer/footer.tsx',
                'shared/layout/header/header.tsx',
                // util
                'shared/util/date-utils.ts',
                'shared/util/pagination.constants.ts'
                // components
                // model
            ]
        },
        {
            condition: generator => generator.useSass,
            path: REACT_DIR,
            templates: [
                'shared/layout/header/header.scss',
                'shared/layout/footer/footer.scss'
            ]
        },
        {
            condition: generator => !generator.useSass,
            path: REACT_DIR,
            templates: [
                'shared/layout/header/header.css',
                'shared/layout/footer/footer.css'
            ]
        },
    // {
    //   condition: generator => generator.enableTranslation,
    //   path: REACT_DIR,
    //   templates: [
    //     'shared/language/_language.pipe.js',
    //     'shared/language/_language.constants.js',
    //     'shared/language/_language.helper.js'
    //   ]
    // },
    // {
    //   condition: generator => !generator.skipUserManagement,
    //   path: REACT_DIR,
    //   templates: [
    //     'shared/user/_user.model.js',
    //     'shared/user/_user.service.js'
    //   ]
    // }
    ],
    // angularAuthService: [
    //   {
    //     path: REACT_DIR,
    //     templates: [
    //       'shared/auth/_auth.service.js',
    //       'shared/auth/_csrf.service.js',
    //       'shared/auth/_state-storage.service.js',
    //       'shared/auth/_principal.service.js',
    //       'shared/auth/_has-any-authority.directive.js',
    //       'shared/auth/_account.service.js',
    //       'shared/auth/_user-route-access-service.js'
    //     ]
    //   },
    //   {
    //     condition: generator => generator.authenticationType === 'oauth2',
    //     path: REACT_DIR,
    //     templates: [
    //       'shared/auth/_auth-oauth2.service.js'
    //     ]
    //   },
    //   {
    //     condition: generator => generator.authenticationType === 'jwt' || generator.authenticationType === 'uaa',
    //     path: REACT_DIR,
    //     templates: [
    //       'shared/auth/_auth-jwt.service.js'
    //     ]
    //   },
    //   {
    //     condition: generator => generator.authenticationType === 'session',
    //     path: REACT_DIR,
    //     templates: [
    //       'shared/auth/_auth-session.service.js'
    //     ]
    //   }
    // ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
                'karma.conf.js',
                'spec/entry.ts',
                'spec/app/utils.ts',
                'spec/app/config/notification-middleware.spec.ts',
                'spec/app/shared/layout/header.spec.tsx'
                // 'spec/app/account/activate/_activate.component.spec.js',
                // 'spec/app/account/password/_password.component.spec.js',
                // 'spec/app/account/password/_password-strength-bar.component.spec.js',
                // 'spec/app/account/password-reset/init/_password-reset-init.component.spec.js',
                // 'spec/app/account/password-reset/finish/_password-reset-finish.component.spec.js',
                // 'spec/app/account/register/_register.component.spec.js',
                // 'spec/app/account/settings/_settings.component.spec.js',
                // 'spec/app/admin/health/_health.component.spec.js',
                // 'spec/app/admin/audits/_audits.component.spec.js',
                // 'spec/helpers/_spyobject.js',
                // 'spec/helpers/_mock-account.service.js',
                // 'spec/helpers/_mock-principal.service.js',
                // 'spec/helpers/_mock-route.service.js'
            ]
        },
    //   {
    //     condition: generator => generator.authenticationType === 'session',
    //     path: TEST_SRC_DIR,
    //     templates: [
    //       'spec/app/account/sessions/_sessions.component.spec.js',
    //     ]
    //   },
    //   {
    //     condition: generator => generator.enableTranslation,
    //     path: TEST_SRC_DIR,
    //     templates: [
    //       'spec/helpers/_mock-language.service.js'
    //     ]
    //   },
    //   {
    //     condition: generator => generator.websocket === 'spring-websocket',
    //     path: TEST_SRC_DIR,
    //     templates: [
    //       'spec/helpers/_mock-tracker.service.js'
    //     ]
    //   },
    //   {
    //     condition: generator => generator.protractorTests,
    //     path: TEST_SRC_DIR,
    //     templates: [
    //       'e2e/account/_account.spec.js',
    //       'e2e/admin/_administration.spec.js',
    //       '_protractor.conf.js'
    //     ]
    //   }
    ]
};

module.exports = {
    writeFiles,
    files
};

function writeFiles() {
    mkdirp(MAIN_SRC_DIR);
    // write React files
    this.writeFilesToDisk(files, this, false, 'react');
}
