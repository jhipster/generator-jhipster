/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const utils = require('../utils');

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
                '.huskyrc',
                '.postcssrc.js',
                'tslint.json',
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
                { file: 'content/images/jhipster_family_member_0.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3.svg', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-192.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-256.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-384.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_0_head-512.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_1_head-512.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_2_head-512.png', method: 'copy' },
                { file: 'content/images/jhipster_family_member_3_head-512.png', method: 'copy' },
                { file: 'content/images/logo-jhipster.png', method: 'copy' }
            ]
        }
    ],
    css: [
        {
            path: MAIN_SRC_DIR,
            templates: [
                'content/css/loading.css'
            ]
        }
    ],
    sass: [
        {
            path: MAIN_SRC_DIR,
            templates: ['content/scss/_bootstrap-variables.scss', 'content/scss/global.scss', 'content/scss/vendor.scss']
        },
        {
            condition: generator => generator.enableI18nRTL,
            path: MAIN_SRC_DIR,
            templates: ['content/scss/rtl.scss']
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
                'WEB-INF/web.xml',
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
                'shared/config/axios-interceptor.ts',
                'shared/config/config.ts',
                'shared/config/config-bootstrap-vue.ts',
                'shared/config/store/account-store.ts',
                'shared/config/store/alert-store.ts',
                'shared/security/authority.ts',
                'router/index.ts',
                'router/admin.ts',
                'router/entities.ts',
                'router/pages.ts'
            ]
        }
    ],
    i18n: [
        {
            condition: generator => generator.enableTranslation,
            path: VUE_DIR,
            templates: [
                'locale/translation.service.ts',
                'shared/config/formatter.ts',
                'shared/config/store/translation-store.ts',
            ]
        }
    ],
    sharedVueApp: [
        {
            path: VUE_DIR,
            templates: [
                'core/home/home.vue',
                'core/home/home.component.ts',
                'core/error/error.vue',
                'core/error/error.component.ts',
                'core/jhi-footer/jhi-footer.vue',
                'core/jhi-footer/jhi-footer.component.ts',
                'core/jhi-navbar/jhi-navbar.vue',
                'core/jhi-navbar/jhi-navbar.component.ts',
                'core/ribbon/ribbon.vue',
                'core/ribbon/ribbon.component.ts',
                'shared/date/filters.ts',
                'shared/sort/jhi-sort-indicator.component.ts',
                'shared/sort/jhi-sort-indicator.vue',
                'shared/sort/sorts.ts',
                'shared/alert/alert.service.ts',
                'shared/alert/alert.mixin.ts',
                'shared/data/data-utils.service.ts',
                'shared/jhi-item-count.component.ts',
                'shared/jhi-item-count.vue',
                'shared/model/user.model.ts'
            ]
        }
    ],
    accountModule: [
        {
            path: VUE_DIR,
            templates: [
                'account/account.service.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: VUE_DIR,
            templates: [
                'account/login-form/login-form.vue',
                'account/login-form/login-form.component.ts',
                'account/login.service.ts',
                'router/account.ts',
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: VUE_DIR,
            templates: [
                'account/change-password/change-password.vue',
                'account/change-password/change-password.component.ts',
                'account/register/register.vue',
                'account/register/register.component.ts',
                'account/register/register.service.ts',
                'account/reset-password/init/reset-password-init.vue',
                'account/reset-password/init/reset-password-init.component.ts',
                'account/reset-password/finish/reset-password-finish.vue',
                'account/reset-password/finish/reset-password-finish.component.ts',
                'account/settings/settings.vue',
                'account/settings/settings.component.ts',
                'account/activate/activate.component.ts',
                'account/activate/activate.service.ts',
                'account/activate/activate.vue'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session' && !this.skipUserManagement,
            path: VUE_DIR,
            templates: [
                'account/sessions/sessions.vue',
                'account/sessions/sessions.component.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'oauth2',
            path: VUE_DIR,
            templates: [
                'account/login.service.ts'
            ]
        }
    ],
    adminModule: [
        {
            path: VUE_DIR,
            templates: [
                // admin modules
                'admin/configuration/configuration.vue',
                'admin/configuration/configuration.component.ts',
                'admin/configuration/configuration.service.ts',
                'admin/docs/docs.vue',
                'admin/docs/docs.component.ts',
                'admin/health/health.vue',
                'admin/health/health.component.ts',
                'admin/health/health-modal.vue',
                'admin/health/health-modal.component.ts',
                'admin/health/health.service.ts',
                'admin/logs/logs.vue',
                'admin/logs/logs.component.ts',
                'admin/logs/logs.service.ts',
                'admin/metrics/metrics.vue',
                'admin/metrics/metrics.component.ts',
                'admin/metrics/metrics.service.ts',
                'admin/metrics/metrics-modal.vue',
                'admin/metrics/metrics-modal.component.ts'
            ]
        },
        {
            condition: generator => (generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra',
            path: VUE_DIR,
            templates: [
                'admin/audits/audits.vue',
                'admin/audits/audits.component.ts',
                'admin/audits/audits.service.ts'
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: VUE_DIR,
            templates: [
                'admin/tracker/tracker.vue',
                'admin/tracker/tracker.component.ts',
                'admin/tracker/tracker.service.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: VUE_DIR,
            templates: [
                'admin/user-management/user-management.vue',
                'admin/user-management/user-management.component.ts',
                'admin/user-management/user-management-view.vue',
                'admin/user-management/user-management-view.component.ts',
                'admin/user-management/user-management-edit.vue',
                'admin/user-management/user-management-edit.component.ts',
                'admin/user-management/user-management.service.ts'
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: VUE_DIR,
            templates: [
                'admin/gateway/gateway.vue',
                'admin/gateway/gateway.component.ts',
                'admin/gateway/gateway.service.ts'
            ]
        }
    ],
    clientTestConfig: [
        {
            path: TEST_SRC_DIR,
            templates: [
                'jest.conf.js',
            ]
        }
    ],
    clientTestFw: [
        {
            path: TEST_SRC_DIR,
            templates: [
                'jest.conf.js',
                'spec/app/account/account.service.spec.ts',
                'spec/app/core/home/home.component.spec.ts',
                'spec/app/core/error/error.component.spec.ts',
                'spec/app/core/jhi-navbar/jhi-navbar.component.spec.ts',
                'spec/app/core/ribbon/ribbon.component.spec.ts',
                'spec/app/shared/alert/alert.service.spec.ts',
                'spec/app/shared/config/axios-interceptor.spec.ts',
                'spec/app/shared/data/data-utils.service.spec.ts',
                'spec/app/admin/configuration/configuration.component.spec.ts',
                'spec/app/admin/health/health.component.spec.ts',
                'spec/app/admin/health/health-modal.component.spec.ts',
                'spec/app/admin/health/health.service.spec.ts',
                'spec/app/admin/logs/logs.component.spec.ts',
                'spec/app/admin/metrics/metrics.component.spec.ts',
                'spec/app/admin/metrics/metrics-modal.component.spec.ts'
            ]
        },
        {
            condition: generator => ((generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra'),
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/admin/audits/audits.component.spec.ts'
            ]
        },
        {
            condition: generator => generator.enableTranslation,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/shared/config/formatter.spec.ts',
            ]
        },
        {
            condition: generator => generator.authenticationType === 'oauth2',
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/login.service.spec.ts',
            ]
        },
        {
            condition: generator => generator.authenticationType !== 'oauth2',
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/login-form/login-form.component.spec.ts'
            ]
        },
        {
            condition: generator => generator.authenticationType === 'session' && !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/sessions/sessions.component.spec.ts',
                'spec/app/account/login.service.spec.ts'
            ]
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/account/change-password/change-password.component.spec.ts',
                'spec/app/account/register/register.component.spec.ts',
                'spec/app/account/reset-password/init/reset-password-init.component.spec.ts',
                'spec/app/account/reset-password/finish/reset-password-finish.component.spec.ts',
                'spec/app/account/settings/settings.component.spec.ts',
                'spec/app/account/activate/activate.component.spec.ts'
            ]
        },
        {
            condition: generator => (generator.databaseType !== 'no' || generator.authenticationType === 'uaa') && generator.databaseType !== 'cassandra',
            path: TEST_SRC_DIR,
            templates: ['spec/app/admin/audits/audits.component.spec.ts']
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: TEST_SRC_DIR,
            templates: [
                'spec/app/admin/tracker/tracker.component.spec.ts',
                'spec/app/admin/tracker/tracker.service.spec.ts'
            ]
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
                'e2e/page-objects/navbar-page.ts',
                'e2e/page-objects/signin-page.ts',
                'e2e/page-objects/alert-page.ts',
                'e2e/page-objects/administration-page.ts',
                'protractor.conf.js'
            ]
        },
        {
            condition: generator => generator.protractorTests && !generator.skipUserManagement,
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
    // write Vue.js files
    this.writeFilesToDisk(vueFiles, this, false, `${CLIENT_VUE_TEMPLATES_DIR}`);

    if (!this.enableTranslation) {
        utils.replaceTranslation(this, [
            'app/app.vue',
            'app/core/home/home.vue',
            'app/core/error/error.vue',
            'app/core/jhi-footer/jhi-footer.vue',
            'app/core/jhi-navbar/jhi-navbar.vue',
            'app/core/ribbon/ribbon.vue',
            'app/shared/jhi-item-count.vue',
            'app/admin/configuration/configuration.vue',
            'app/admin/health/health.vue',
            'app/admin/health/health-modal.vue',
            'app/admin/logs/logs.vue',
            'app/admin/metrics/metrics.vue',
            'app/admin/metrics/metrics-modal.vue'
        ]);
        if ((this.databaseType !== 'no' || this.authenticationType === 'uaa') && this.databaseType !== 'cassandra') {
            utils.replaceTranslation(this, [
                'app/admin/audits/audits.vue'
            ]);
        }
        if (this.authenticationType !== 'oauth2') {
            utils.replaceTranslation(this, [
                'app/account/login-form/login-form.vue',
            ]);
        }
        if (!this.skipUserManagement) {
            utils.replaceTranslation(this, [
                'app/account/change-password/change-password.vue',
                'app/account/activate/activate.vue',
                'app/account/register/register.vue',
                'app/account/reset-password/init/reset-password-init.vue',
                'app/account/reset-password/finish/reset-password-finish.vue',
                'app/account/settings/settings.vue',
                'app/admin/user-management/user-management.vue',
                'app/admin/user-management/user-management-view.vue',
                'app/admin/user-management/user-management-edit.vue'
            ]);
        }
        if (this.authenticationType === 'session' && !this.skipUserManagement) {
            utils.replaceTranslation(this, ['app/account/sessions/sessions.vue']);
        }
        if (this.applicationType === 'gateway' && this.serviceDiscoveryType) {
            utils.replaceTranslation(this, ['app/admin/gateway/gateway.vue']);
        }
        if (this.websocket === 'spring-websocket') {
            utils.replaceTranslation(this, ['app/admin/tracker/tracker.vue']);
        }
    }
}
