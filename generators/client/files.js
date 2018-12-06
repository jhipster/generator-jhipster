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
                'app.vue',
                'app.component.ts',
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
                'components/home/home.vue',
                'components/home/home.component.ts',
                'components/jhi-footer/jhi-footer.vue',
                'components/jhi-footer/jhi-footer.component.ts',
                'components/jhi-navbar/jhi-navbar.vue',
                'components/jhi-navbar/jhi-navbar.component.ts',
                'components/ribbon/ribbon.vue',
                'components/ribbon/ribbon.component.ts',
                'shared/date/filters.ts',
                'shared/data/DataUtilsService.vue',
                'shared/jhi-item-count.vue'
            ]
        }
    ],
    accountModule: [
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: VUE_DIR,
            templates: [
                'components/account/change-password/change-password.vue',
                'components/account/change-password/change-password.component.ts',
                'components/account/login-form/login-form.vue',
                'components/account/login-form/login-form.component.ts',
                'components/account/LoginModalService.vue',
                'components/account/Principal.vue',
                'components/account/register/register.vue',
                'components/account/register/register.component.ts',
                'components/account/RegisterService.vue',
                'components/account/reset-password/reset-password.vue',
                'components/account/reset-password/reset-password.component.ts',
                'components/account/settings/settings.vue',
                'components/account/settings/settings.component.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session',
            path: VUE_DIR,
            templates: [
                'components/account/sessions/sessions.vue',
                'components/account/sessions/sessions.component.ts'
            ]
        }
    ],
    adminModule: [
        {
            path: VUE_DIR,
            templates: [
                // admin modules
                'components/admin/configuration/configuration.vue',
                'components/admin/configuration/configuration.component.ts',
                'components/admin/configuration/configuration.service.ts',
                'components/admin/docs/docs.vue',
                'components/admin/docs/docs.component.ts',
                'components/admin/health/health.vue',
                'components/admin/health/health.component.ts',
                'components/admin/health/health-modal.vue',
                'components/admin/health/HealthService.vue',
                'components/admin/logs/logs.vue',
                'components/admin/logs/logs.component.ts',
                'components/admin/logs/LogsService.ts',
                'components/admin/audits/audits.vue',
                'components/admin/audits/audits.component.ts',
                'components/admin/audits/audits.service.ts',
                'components/admin/metrics/metrics.vue',
                'components/admin/metrics/metrics.component.ts',
                'components/admin/metrics/MetricsService.vue',
                'components/admin/metrics/metrics-modal.vue',
                'components/admin/metrics/metrics-modal.component.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: VUE_DIR,
            templates: [
                'components/admin/tracker/tracker.vue',
                'components/admin/tracker/tracker.component.ts',
                'components/admin/tracker/trackerService.vue'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: VUE_DIR,
            templates: [
                'components/admin/user-management/user-management.vue',
                'components/admin/user-management/user-management.component.ts',
                'components/admin/user-management/user-management-view.vue',
                'components/admin/user-management/user-management-view.component.ts',
                'components/admin/user-management/user-management-edit.vue',
                'components/admin/user-management/user-management-edit.component.ts',
                'components/admin/user-management/UserManagementService.ts'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: VUE_DIR,
            templates: [
                'components/admin/gateway/gateway.vue',
                'components/admin/gateway/gateway.component.ts',
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
        utils.replaceTranslation(this, ['app/app.vue',
            'app/components/home/home.vue',
            'app/components/jhi-footer/jhi-footer.vue',
            'app/components/jhi-navbar/jhi-navbar.vue',
            'app/components/ribbon/ribbon.vue',
            'app/shared/jhi-item-count.vue',
            'app/components/account/change-password/change-password.vue',
            'app/components/account/login-form/login-form.vue',
            'app/components/account/register/register.vue',
            'app/components/account/reset-password/reset-password.vue',
            'app/components/account/settings/settings.vue',
            'app/components/admin/user-management/user-management.vue',
            'app/components/admin/user-management/user-management-view.vue',
            'app/components/admin/user-management/user-management-edit.vue',
            'app/components/admin/configuration/configuration.vue',
            'app/components/admin/health/health.vue',
            'app/components/admin/health/health-modal.vue',
            'app/components/admin/logs/logs.vue',
            'app/components/admin/metrics/metrics.vue',
            'app/components/admin/metrics/metrics-modal.vue',
            'app/components/admin/audits/audits.vue'
        ]);
        if (this.authenticationType === 'session') {
            utils.replaceTranslation(this, ['app/components/account/sessions/sessions.vue']);
        }
        if (this.applicationType === 'gateway' && this.serviceDiscoveryType) {
            utils.replaceTranslation(this, ['app/components/admin/gateway/gateway.vue']);
        }
        if (this.websocket === 'spring-websocket') {
            utils.replaceTranslation(this, ['app/components/admin/tracker/tracker.vue']);
        }
    }
}
