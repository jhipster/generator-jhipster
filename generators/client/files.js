/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const mkdirp = require('mkdirp');
const constants = require('generator-jhipster/generators/generator-constants');
const utils = require('./utils');

const MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const VUE_DIR = constants.ANGULAR_DIR;
const CLIENT_VUE_TEMPLATES_DIR = 'vue';

module.exports = {
    writeFiles
};

const vueFiles = {
    common: [
        {
            templates: [
                'package.json',
                'tsconfig.json',
                '.babelrc',
                '.postcssrc.js',
                '.eslintrc.json',
                'config/index.js',
                'config/dev.env.js',
                'config/prod.env.js',
                'webpack/webpack.common.js',
                'webpack/webpack.dev.js',
                'webpack/webpack.prod.js',
                'webpack/vue.utils.js',
                'webpack/loader.conf.js',
                'webpack/utils.js'
            ]
        },
        {
            condition: generator => generator.protractorTests,
            templates: ['tsconfig.e2e.json']
        }
    ],
    image: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                { file: 'content/images/hipster.png', method: 'copy' },
                { file: 'content/images/hipster2x.png', method: 'copy' },
                { file: 'content/images/hipster192.png', method: 'copy' },
                { file: 'content/images/hipster256.png', method: 'copy' },
                { file: 'content/images/hipster384.png', method: 'copy' },
                { file: 'content/images/hipster512.png', method: 'copy' },
                { file: 'content/images/logo-jhipster.png', method: 'copy' }
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
                'manifest.webapp'
            ]
        }
    ],
    vueApp: [
        {
            path: VUE_DIR,
            templates: [
                'App.vue',
                'App.component.ts',
                'shims-vue.d.ts',
                'constants.ts',
                'main.ts',
                'config/axios-interceptor.ts',
                'shared/config.ts',
                'router/index.ts',
                'locale/LanguageService.vue',
                'locale/TranslationService.vue'
            ]
        }
    ],
    sharedVueApp: [
        {
            path: VUE_DIR,
            templates: [
                'components/home/Home.vue',
                'components/home/Home.component.ts',
                'components/jhi-footer/JhiFooter.vue',
                'components/jhi-footer/JhiFooter.component.ts',
                'components/jhi-navbar/JhiNavbar.vue',
                'components/jhi-navbar/JhiNavbar.component.ts',
                'components/ribbon/Ribbon.vue',
                'components/ribbon/Ribbon.component.ts',
                'shared/date/filters.ts',
                'shared/data/DataUtilsService.vue',
                'shared/ItemCount.vue'
            ]
        }
    ],
    accountModule: [
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: VUE_DIR,
            templates: [
                'components/account/change-password/ChangePassword.vue',
                'components/account/change-password/ChangePassword.component.ts',
                'components/account/login-form/LoginForm.vue',
                'components/account/login-form/LoginForm.component.ts',
                'components/account/LoginModalService.vue',
                'components/account/Principal.vue',
                'components/account/register/Register.vue',
                'components/account/register/Register.component.ts',
                'components/account/RegisterService.vue',
                'components/account/reset-password/ResetPassword.vue',
                'components/account/reset-password/ResetPassword.component.ts',
                'components/account/settings/Settings.vue',
                'components/account/settings/Settings.component.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: VUE_DIR,
            templates: [
                'components/account/sessions/Sessions.vue',
                'components/account/sessions/Sessions.component.ts'
            ]
        }
    ],
    adminModule: [
        {
            path: VUE_DIR,
            templates: [
                // admin modules
                'components/admin/configuration/Configuration.vue',
                'components/admin/configuration/Configuration.component.ts',
                'components/admin/configuration/ConfigurationService.vue',
                'components/admin/docs/Docs.vue',
                'components/admin/docs/Docs.component.ts',
                'components/admin/health/Health.vue',
                'components/admin/health/Health.component.ts',
                'components/admin/health/HealthModal.vue',
                'components/admin/health/HealthService.vue',
                'components/admin/logs/Logs.vue',
                'components/admin/logs/Logs.component.ts',
                'components/admin/logs/LogsService.ts',
                'components/admin/audits/Audits.vue',
                'components/admin/audits/Audits.component.ts',
                'components/admin/audits/AuditsService.vue',
                'components/admin/metrics/Metrics.vue',
                'components/admin/metrics/Metrics.component.ts',
                'components/admin/metrics/MetricsService.vue',
                'components/admin/metrics/MetricsModal.vue',
                'components/admin/metrics/Metrics.modal.component.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: VUE_DIR,
            templates: [
                'components/admin/tracker/Tracker.vue',
                'components/admin/tracker/Tracker.component.ts',
                'components/admin/tracker/TrackerService.vue'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: VUE_DIR,
            templates: [
                'components/admin/user-management/UserManagement.vue',
                'components/admin/user-management/UserManagement.component.ts',
                'components/admin/user-management/UserManagementView.vue',
                'components/admin/user-management/UserManagementView.component.ts',
                'components/admin/user-management/UserManagementEdit.vue',
                'components/admin/user-management/UserManagementEdit.component.ts',
                'components/admin/user-management/UserManagementService.vue'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: VUE_DIR,
            templates: [
                'components/admin/gateway/Gateway.vue',
                'components/admin/gateway/Gateway.component.ts',
                'components/admin/gateway/GatewayService.vue'
            ]
        }
    ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/jhi-footer/jhi-footer.component.spec.ts',
                'spec/app/ribbon/ribbon.component.spec.ts',
                'spec/app/admin/configuration/configuration.component.spec.ts',
                'spec/app/admin/docs/docs.component.spec.ts',
                'spec/app/admin/health/health.component.spec.ts',
                'spec/app/admin/logs/logs.component.spec.ts',
                'spec/app/admin/audits/audits.component.spec.ts',
                'spec/app/admin/metrics/metrics.component.spec.ts',
                'spec/app/admin/metrics/metrics-modal.component.spec.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/change-password/change-password.component.spec.ts',
                'spec/app/account/settings/settings.component.spec.ts'
            ]
        },
        {
            condition: generator => generator.databaseType !== 'no' && generator.databaseType !== 'cassandra',
            path: TEST_SRC_DIR,
            templates: ['spec/app/admin/audits/audits.component.spec.ts']
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/admin/user-management/user-management.component.spec.ts',
                'spec/app/admin/user-management/user-management-view.component.spec.ts',
                'spec/app/admin/user-management/user-management-edit.component.spec.ts'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/admin/gateway/gateway.component.spec.ts'
            ]
        },
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
            templates: [
                'e2e/page-objects/password-page.ts',
                'e2e/page-objects/settings-page.ts',
                'e2e/page-objects/register-page.ts'
            ]
        }
    ]
};

function writeFiles() {
    mkdirp(MAIN_SRC_DIR);
    // write React files
    this.writeFilesToDisk(vueFiles, this, false, `${CLIENT_VUE_TEMPLATES_DIR}`);
    const entityFolderName = this.getEntityFolderName(this.clientRootFolder, 'user');
    this.copy('vue/src/main/webapp/app/entities/UserService.vue', `src/main/webapp/app/entities/${entityFolderName}/user.service.vue`);

    utils.addLanguagesToApplication(this);
    utils.addLanguagesToWebPackConfiguration(this);

    if (!this.enableTranslation) {
        utils.replaceTranslation(this, ['app/App.vue',
            'app/components/home/Home.vue',
            'app/components/jhi-footer/JhiFooter.vue',
            'app/components/jhi-navbar/JhiNavbar.vue',
            'app/components/ribbon/Ribbon.vue',
            'app/shared/ItemCount.vue',
            'app/components/account/change-password/ChangePassword.vue',
            'app/components/account/login-form/LoginForm.vue',
            'app/components/account/register/Register.vue',
            'app/components/account/reset-password/ResetPassword.vue',
            'app/components/account/sessions/Sessions.vue',
            'app/components/account/settings/Settings.vue',
            'app/components/admin/user-management/UserManagement.vue',
            'app/components/admin/user-management/UserManagementView.vue',
            'app/components/admin/user-management/UserManagementEdit.vue',
            'app/components/admin/configuration/Configuration.vue',
            'app/components/admin/health/Health.vue',
            'app/components/admin/health/HealthModal.vue',
            'app/components/admin/logs/Logs.vue',
            'app/components/admin/metrics/Metrics.vue',
            'app/components/admin/metrics/MetricsModal.vue',
            'app/components/admin/audits/Audits.vue'
        ]);
        if (this.applicationType === 'gateway' && this.serviceDiscoveryType) {
            utils.replaceTranslation(this, ['app/components/admin/gateway/Gateway.vue']);
        }
        if (this.websocket === 'spring-websocket') {
            utils.replaceTranslation(this, ['app/components/admin/tracker/Tracker.vue']);
        }
    }
}
