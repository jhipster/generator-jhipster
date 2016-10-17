'use strict';

const mkdirp = require('mkdirp');
/* Constants use throughout */
const constants = require('../generator-constants'),
    MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    ANGULAR_DIR = constants.ANGULAR_DIR;

const files = {
    common: [
        {
            type: 'template',
            templates: [
                '_package.json',
                '_bower.json',
                '_tsconfig.json',
                '_.bowerrc',
                '_tslint.json',
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
            type: 'template',
            from: MAIN_SRC_DIR,
            templates: [
                'content/css/_main.css'
            ]
        },
        {
            type: 'copy',
            from: MAIN_SRC_DIR,
            templates: [
                'content/css/_documentation.css'
            ]
        }
    ],
    sass: [
        {
            type: 'template',
            condition: () => this.useSass,
            from: MAIN_SRC_DIR,
            templates: [
                'scss/_main.scss',
                'scss/_vendor.scss'
            ]
        }
    ],
    commonWeb: [
        {
            type: 'copy',
            from: MAIN_SRC_DIR,
            templates: [
                '_favicon.ico',
                '_robots.txt',
                '_404.html',
            ]
        }
    ],
    swagger: [
        {
            type: 'template',
            from: MAIN_SRC_DIR,
            templates: [
                'swagger-ui/_index.html'
            ]
        },
        {
            type: 'copy',
            from: MAIN_SRC_DIR,
            templates: [
                'swagger-ui/images/_throbber.gif'
            ]
        }
    ],
    angularApp: [
        {
            type: 'copyHtml',
            from: MAIN_SRC_DIR,
            templates: [
                '_index.html'
            ]
        },
        {
            type: 'copy',
            from: MAIN_SRC_DIR,
            templates: [
                '_system.config.js'
            ]
        },
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                '_upgrade_adapter.ts',
                '_app.main.ts',
                '_app.module.ts',
                '_app.ng2module.ts',
                '_app.state.ts',
                '_app.constants.ts',
                'blocks/handlers/_state.handler.ts',
                'blocks/config/_http.config.ts',
                'blocks/config/_localstorage.config.ts',
                'blocks/config/_compile.config.ts',
                'blocks/config/_uib-pager.config.ts',
                'blocks/config/_uib-pagination.config.ts',
                'blocks/config/_ui-router-defer-intercept.config.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.enableTranslation,
            from: ANGULAR_DIR,
            templates: [
                'blocks/config/_translation.config.ts',
                'blocks/config/_translation-storage.provider.ts'
            ]
        }
    ],
    angularAuth: [
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                'account/_index.ts',
                'account/_account.module.ts',
                'account/_account.ng2module.ts',
                'account/_account.state.ts',
                'account/activate/_activate.component.ts',
                'account/activate/_activate.service.ts',
                'account/password/_password.component.ts',
                'account/password/_password.service.ts',
                'account/password/_password-strength-bar.component.ts',
                'account/register/_register.component.ts',
                'account/register/_register.service.ts',
                'account/password-reset/init/_password-reset-init.component.ts',
                'account/password-reset/init/_password-reset-init.service.ts',
                'account/password-reset/finish/_password-reset-finish.component.ts',
                'account/password-reset/finish/_password-reset-finish.service.ts',
                'account/settings/_settings.component.ts'
            ]
        },
        {
            type: 'copyHtml',
            from: ANGULAR_DIR,
            templates: [
                'account/activate/_activate.html',
                'account/password/_password.html',
                'account/register/_register.html',
                'account/password-reset/init/_password-reset-init.html',
                'account/password-reset/finish/_password-reset-finish.html',
                'account/settings/_settings.html'

            ]
        },
        {
            type: 'copyJs',
            from: ANGULAR_DIR,
            templates: [
                'account/activate/_activate.state.ts',
                'account/password/_password.state.ts',
                'account/register/_register.state.ts',
                'account/password-reset/init/_password-reset-init.state.ts',
                'account/password-reset/finish/_password-reset-finish.state.ts',
                'account/settings/_settings.state.ts'
            ]
        },
        {
            type: 'copyJs',
            condition: generator => generator.authenticationType === 'session',
            from: ANGULAR_DIR,
            templates: [
                'account/sessions/_sessions.state.ts'
            ]
        },
        {
            type: 'copyHtml',
            condition: generator => generator.authenticationType === 'session',
            from: ANGULAR_DIR,
            templates: [
                'account/sessions/_sessions.html'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.authenticationType === 'session',
            from: ANGULAR_DIR,
            templates: [
                'account/sessions/_sessions.component.ts',
                'account/sessions/_sessions.service.ts',
                'account/sessions/_session.model.ts'
            ]
        },
        {
            type: 'copyHtml',
            condition: generator => generator.enableSocialSignIn,
            from: ANGULAR_DIR,
            templates: [
                'account/social/directive/_social.html',
                'account/social/_social-register.html'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.enableSocialSignIn,
            from: ANGULAR_DIR,
            templates: [
                'account/social/directive/_social.directive.ts',
                'account/social/_social-register.controller.ts',
                'account/social/_social.service.ts'
            ]
        },
        {
            type: 'copyJs',
            condition: generator => generator.enableSocialSignIn,
            from: ANGULAR_DIR,
            templates: [
                'account/social/_social.state.ts'
            ]
        },
        {
            type: 'copyJs',
            condition: generator => generator.enableSocialSignIn && this.authenticationType === 'jwt',
            from: ANGULAR_DIR,
            templates: [
                'account/social/_social-auth.controller.ts'
            ]
        }
    ],
    angularAdminModule: [
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                'admin/_index.ts',
                'admin/_admin.module.ts',
                'admin/_admin.ng2module.ts',
                'admin/_admin.state.ts',
                // admin modules
                'admin/audits/_audit-data.model.ts',
                'admin/audits/_audit.model.ts',
                'admin/audits/_audits.component.ts',
                'admin/audits/_audits.service.ts',
                'admin/configuration/_configuration.component.ts',
                'admin/configuration/_configuration.service.ts',
                'admin/docs/_docs.component.ts',
                'admin/docs/_docs.html',
                'admin/health/_health.component.ts',
                'admin/health/_health-modal.component.ts',
                'admin/health/_health.service.ts',
                'admin/logs/_logs.component.ts',
                'admin/logs/_log.model.ts',
                'admin/logs/_logs.service.ts',
                'admin/metrics/_metrics.component.ts',
                'admin/metrics/_metrics-modal.component.ts',
                'admin/metrics/_metrics.service.ts'

            ]
        },
        {
            type: 'copyHtml',
            from: ANGULAR_DIR,
            templates: [
                'admin/audits/_audits.component.html',
                'admin/configuration/_configuration.html',
                'admin/health/_health.html',
                'admin/health/_health-modal.html',
                'admin/logs/_logs.html'
            ]
        },
        {
            type: 'copyHtml',
            template: true,
            from: ANGULAR_DIR,
            templates: [
                'admin/metrics/_metrics.html',
                'admin/metrics/_metrics-modal.html'

            ]
        },
        {
            type: 'copyJs',
            from: ANGULAR_DIR,
            templates: [
                'admin/audits/_audits.state.ts',
                'admin/configuration/_configuration.state.ts',
                'admin/docs/_docs.state.ts',
                'admin/health/_health.state.ts',
                'admin/logs/_logs.state.ts',
                'admin/metrics/_metrics.state.ts'
            ]
        },
        {
            type: 'copyJs',
            condition: generator => generator.websocket === 'spring-websocket',
            from: ANGULAR_DIR,
            templates: [
                'admin/tracker/_tracker.state.ts'
            ]
        },
        {
            type: 'copyHtml',
            condition: generator => generator.websocket === 'spring-websocket',
            from: ANGULAR_DIR,
            templates: [
                'admin/tracker/_tracker.html'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.websocket === 'spring-websocket',
            from: ANGULAR_DIR,
            templates: [
                'admin/tracker/_tracker.component.ts',
                'shared/tracker/_tracker.service.ts'
            ]
        },
        {
            type: 'template',
            condition: () => !this.skipUserManagement,
            from: ANGULAR_DIR,
            templates: [
                'admin/user-management/_user-management.controller.ts',
                'admin/user-management/_user-management-detail.controller.ts',
                'admin/user-management/_user-management-dialog.controller.ts',
                'admin/user-management/_user-management-delete-dialog.controller.ts',
                'admin/user-management/_user.service.ts',
            ]
        },
        {
            type: 'copyJs',
            condition: () => !this.skipUserManagement,
            from: ANGULAR_DIR,
            templates: [
                'admin/user-management/_user-management.state.ts'
            ]
        },
        {
            type: 'copyHtml',
            condition: () => !this.skipUserManagement,
            from: ANGULAR_DIR,
            templates: [
                'admin/user-management/user-management.html',
                'admin/user-management/_user-management-detail.html',
                'admin/user-management/_user-management-dialog.html',
                'admin/user-management/_user-management-delete-dialog.html'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.applicationType === 'gateway',
            from: ANGULAR_DIR,
            templates: [
                'admin/gateway/_gateway.component.ts',
                'admin/gateway/_gateway-routes.service.ts',
                'admin/gateway/_gateway-route.model.ts'
            ]
        },
        {
            type: 'copyJs',
            condition: generator => generator.applicationType === 'gateway',
            from: ANGULAR_DIR,
            templates: [
                'admin/gateway/_gateway.state.ts'
            ]
        },
        {
            type: 'copyHtml',
            condition: generator => generator.applicationType === 'gateway',
            from: ANGULAR_DIR,
            templates: [
                'admin/gateway/_gateway.html'
            ]
        }
    ],
    blockInterceptors: [
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                'blocks/interceptor/_auth-expired.interceptor.ts',
                'blocks/interceptor/_errorhandler.interceptor.ts',
                'blocks/interceptor/_notification.interceptor.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.authenticationType === 'oauth2' || this.authenticationType === 'jwt' || this.authenticationType === 'uaa',
            from: ANGULAR_DIR,
            templates: [
                'blocks/interceptor/_auth.interceptor.ts'
            ]
        }
    ],
    angularShared: [
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                'shared/_index.ts',
                'shared/_shared.ng2module.ts',
                'shared/_shared-libs.ng2module.ts',
                'shared/_XSRF-strategy.provider.ts',
                'shared/constants/_pagination.constants.ts',

                'shared/model/_account.model.ts',

                'shared/pipe/_keys.pipe.ts',
                'shared/pipe/_filter.pipe.ts',
                'shared/pipe/_order-by.pipe.ts',
                'shared/pipe/_capitalize.pipe.ts',
                'shared/pipe/_truncate-characters.pipe.ts',
                'shared/pipe/_truncate-words.pipe.ts',

                'shared/directive/_sort.directive.ts',
                'shared/directive/_sort-by.directive.ts',
                'shared/directive/_show-validation.directive.ts',
                'shared/directive/_maxbytes.directive.ts',
                'shared/directive/_minbytes.directive.ts',
                'shared/directive/_number-of-bytes.ts',

                'shared/service/_date-util.service.ts',
                'shared/service/_data-util.service.ts',
                'shared/service/_pagination-util.service.ts',
                'shared/service/_parse-links.service.ts',

                'shared/component/_jhi-item-count.component.ts'
            ]
        }
    ],
    angularSharedComponent: [
        {
            type: 'copyHtml',
            from: ANGULAR_DIR,
            templates: [
                'shared/login/_login.html'
            ]
        },
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                'shared/_shared-common.ng2module.ts',
                'shared/login/_login.service.ts',
                'shared/login/_login-modal.service.ts',
                'shared/login/_login.component.ts',
                //alert service code
                'shared/alert/_alert.service.ts',
                'shared/alert/_alert.provider.ts',
                'shared/alert/_alert.component.ts',
                'shared/alert/_alert-error.component.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.enableTranslation,
            from: ANGULAR_DIR,
            templates: [
                'shared/language/_jhi-translate.directive.ts',
                'shared/language/_translate-partial-loader.provider.ts',
                'shared/language/_language.pipe.ts',
                'shared/language/_language.constants.ts',
                'shared/language/_language.service.ts',
                'shared/language/_jhi-missing-translation.config.ts'
            ]
        }
    ],
    angularAuthService: [
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth.service.ts',
                'shared/auth/_csrf.service.ts',
                'shared/auth/_state-storage.service.ts',
                'shared/auth/_principal.service.ts',
                'shared/auth/_has-authority.directive.ts',
                'shared/auth/_has-any-authority.directive.ts',
                'shared/auth/_account.service.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.authenticationType === 'oauth2',
            from: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth-oauth2.service.ts',
                'shared/auth/_base64.service.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.authenticationType === 'jwt' || this.authenticationType === 'uaa',
            from: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth-jwt.service.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.authenticationType === 'session',
            from: ANGULAR_DIR,
            templates: [
                'shared/auth/_auth-session.service.ts'
            ]
        }
    ],
    angularMain: [
        {
            type: 'template',
            from: ANGULAR_DIR,
            templates: [
                // entities
                'entities/_entity.module.ts',
                // home module
                'home/_index.ts',
                'home/_home.component.ts',
                // layouts
                'layouts/_index.ts',
                'layouts/navbar/_navbar.component.ts',
                'layouts/footer/_footer.component.ts',
                'layouts/error/_error.component.ts',

                'layouts/profiles/_profile.service.ts',
                'layouts/profiles/_profile-info.model.ts',
                'layouts/profiles/_page-ribbon.component.ts'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.enableTranslation,
            from: ANGULAR_DIR,
            templates: [
                'layouts/navbar/_active-menu.directive.ts'
            ]
        },
        {
            type: 'copyJs',
            from: ANGULAR_DIR,
            templates: [
                // entities
                'entities/_entity.state.ts',
                // home module
                'home/_home.state.ts',
                'layouts/error/_error.state.ts'
            ]
        },
        {
            type: 'copyHtml',
            from: ANGULAR_DIR,
            templates: [
                // home module
                'home/_home.html',
                'layouts/navbar/_navbar.html',
                'layouts/footer/_footer.html',
                'layouts/error/_error.html'
            ]
        }
    ],
    image: [
        {
            type: 'copy',
            from: MAIN_SRC_DIR,
            templates: [
                'content/images/_hipster.png',
                'content/images/_hipster2x.png',
                'content/images/_logo-jhipster.png'
            ]
        }
    ],
    clientTestFw: [
        {
            type: 'template',
            from: TEST_SRC_DIR,
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
                'spec/app/account/reset/finish/_reset-finish.controller.spec.js',
                'spec/app/account/reset/request/_reset-request.controller.spec.js',
                'spec/app/services/auth/_auth.services.spec.js',
                'spec/app/components/login/_login.controller.spec.js'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.authenticationType === 'session',
            from: TEST_SRC_DIR,
            templates: [
                'spec/app/account/sessions/_sessions.controller.spec.js'
            ]
        },
        {
            type: 'template',
            condition: generator => generator.testFrameworks.indexOf('protractor') !== -1,
            from: TEST_SRC_DIR,
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
    return {
        writeSepcial: function () {
            this.fs.copy(this.templatePath('gulp/_handle-errors.js'), this.destinationPath('gulp/handle-errors.js')); // to avoid interpolate errors
            mkdirp(MAIN_SRC_DIR);
        },

        writeFiles: function () {
            // using the fastest method for iterations
            for (let i = 0, types = Object.keys(files); i < types.length; i++) {
                for (let j = 0, fileTypes = files[types[i]]; j < fileTypes.length; j++) {
                    let template = fileTypes[j];
                    if (!template.condition || template.condition(this)) {
                        let path = template.from ? template.from : '';
                        template.templates.map(templatePath => {
                            this[template.type](path + templatePath, path + templatePath.replace(/_/, ''), this, {}, template.template);
                        });
                    }
                }
            }
        }
    };
}
