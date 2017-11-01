const mkdirp = require('mkdirp');
const constants = require('generator-jhipster/generators/generator-constants');

/* Constants use throughout */
const MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
// const TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
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
        '_.eslintrc.json',
        '_.babelrc',
        '_.editorconfig',
        'webpack/webpack.common.js',
        'webpack/webpack.dev.js',
        'webpack/webpack.prod.js'
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
        { file: 'static/images/logo-jhipster-react.svg', method: 'copy' }
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
        { file: 'favicon.ico', method: 'copy' },
        'robots.txt',
        '404.html',
        'index.html'
      ]
    }
  ],
  reactApp: [
    {
      path: REACT_DIR,
      templates: [
        'app.js',
        'index.js',
        'routes.js',
        'config/constants.js',
        'config/theme.js',
        'config/devtools.js',
        'config/promise-middleware.js',
        'config/store.js'
      ]
    },
    {
      condition: generator => generator.enableTranslation,
      path: REACT_DIR,
      templates: [
        'config/translation.js'
      ]
    },
    {
      condition: generator => generator.useSass,
      path: REACT_DIR,
      templates: [
        { file: 'app.scss', method: 'copy' }
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
  reactMain: [
    {
      path: REACT_DIR,
      templates: [
        // home module
        'modules/home/index.js',
        { file: 'modules/home/home.js', method: 'processJsx' },
        // login module
        'modules/login/index.js',
        { file: 'modules/login/login.js', method: 'processJsx' },
        { file: 'modules/login/login-modal.js', method: 'processJsx' }
      ]
    },
    {
      condition: generator => generator.useSass,
      path: REACT_DIR,
      templates: [
        'modules/home/home.scss',
      ]
    }
  ],
  reducers: [
    {
      path: REACT_DIR,
      templates: [
        // home module
        'reducers/index.js',
        'reducers/administration.js',
        'reducers/authentication.js'
      ]
    },
    {
      condition: generator => generator.enableTranslation,
      path: REACT_DIR,
      templates: [
        'reducers/locale.js'
      ]
    }
  ],
  // accountModule: [
    // {
    //   path: REACT_DIR,
    //   templates: [
    //     'account/_index.js',
    //     { file: 'account/_account.route.js', method: 'processJsx' },
    //     { file: 'account/activate/_activate.route.js', method: 'processJsx' },
    //     { file: 'account/activate/_activate.component.js', method: 'processJsx' },
    //     { file: 'account/password/_password.route.js', method: 'processJsx' },
    //     { file: 'account/password/_password.component.js', method: 'processJsx' },
    //     { file: 'account/register/_register.route.js', method: 'processJsx' },
    //     { file: 'account/register/_register.component.js', method: 'processJsx' },
    //     { file: 'account/password-reset/init/_password-reset-init.route.js', method: 'processJsx' },
    //     { file: 'account/password-reset/init/_password-reset-init.component.js', method: 'processJsx' },
    //     { file: 'account/password-reset/finish/_password-reset-finish.route.js', method: 'processJsx' },
    //     { file: 'account/password-reset/finish/_password-reset-finish.component.js', method: 'processJsx' },
    //     { file: 'account/settings/_settings.route.js', method: 'processJsx' },
    //     { file: 'account/settings/_settings.component.js', method: 'processJsx' }
    //   ]
    // },
    // {
    //   condition: generator => generator.authenticationType === 'session',
    //   path: REACT_DIR,
    //   templates: [
    //     { file: 'account/sessions/_sessions.route.js', method: 'processJsx' },
    //     'account/sessions/_session.model.js',
    //     { file: 'account/sessions/_sessions.component.js', method: 'processJsx' }
    //   ]
    // },
    // {
    //   condition: generator => generator.enableSocialSignIn,
    //   path: REACT_DIR,
    //   templates: [
    //             { file: 'account/social/_social.route.js', method: 'processJsx' },
    //             { file: 'account/social/_social-register.component.js', method: 'processJsx' },
    //             { file: 'account/social/_social-register.component.html', method: 'processHtml' },
    //             { file: 'shared/social/_social.component.js', method: 'processJsx' },
    //             { file: 'shared/social/_social.component.html', method: 'processHtml' },
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
  // ],
  adminModule: [
    {
      path: REACT_DIR,
      templates: [
        // admin modules
        { file: 'modules/administration/audits/audits.js', method: 'processJsx' },
        { file: 'modules/administration/configuration/configuration.js', method: 'processJsx' },
        { file: 'modules/administration/docs/docs.js', method: 'processJsx' },
        { file: 'modules/administration/health/health.js', method: 'processJsx' },
        { file: 'modules/administration/logs/logs.js', method: 'processJsx' },
        { file: 'modules/administration/metrics/metrics.js', method: 'processJsx' },
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
        { file: 'modules/administration/user-management/user-management.js', method: 'processJsx' },
        // { file: 'modules/administration/user-management/UserManagementDetail.js', method: 'processJsx' },
        // { file: 'modules/administration/user-management/UserManagementDialog.js', method: 'processJsx' },
        // { file: 'modules/administration/user-management/UserManagementDeleteDialog.js', method: 'processJsx' }
      ]
    },
    {
      condition: generator => generator.applicationType === 'gateway',
      path: REACT_DIR,
      templates: [
        { file: 'modules/administration/gateway/gateway.js', method: 'processJsx' }
      ]
    }
  ],
  angularShared: [
    {
      path: REACT_DIR,
      templates: [
        // layouts
        'shared/components/footer/footer.js',
        'shared/components/header/header.js',
        'shared/components/private-route/private-route.js',
        // interceptors
        'shared/interceptors/axios.js',
        // util
        'shared/util/global-style.js',
        'shared/util/log-util.js'
      ]
    },
    {
      condition: generator => generator.useSass,
      path: REACT_DIR,
      templates: [
        'shared/components/header/header.scss',
        'shared/variables.scss'
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
  // clientTestFw: [
  //   {
  //     path: TEST_SRC_DIR,
  //     templates: [
  //       '_karma.conf.js',
  //       'spec/_entry.js',
  //       'spec/_test.module.js',
  //       'spec/app/account/activate/_activate.component.spec.js',
  //       'spec/app/account/password/_password.component.spec.js',
  //       'spec/app/account/password/_password-strength-bar.component.spec.js',
  //       'spec/app/account/password-reset/init/_password-reset-init.component.spec.js',
  //       'spec/app/account/password-reset/finish/_password-reset-finish.component.spec.js',
  //       'spec/app/account/register/_register.component.spec.js',
  //       'spec/app/account/settings/_settings.component.spec.js',
  //       'spec/app/admin/health/_health.component.spec.js',
  //       'spec/app/admin/audits/_audits.component.spec.js',
  //       'spec/helpers/_spyobject.js',
  //       'spec/helpers/_mock-account.service.js',
  //       'spec/helpers/_mock-principal.service.js',
  //       'spec/helpers/_mock-route.service.js'
  //     ]
  //   },
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
  // ]
};

module.exports = {
  writeFiles,
  files
};

function writeFiles() {
  mkdirp(MAIN_SRC_DIR);
  // write React files
  this.writeFilesToDisk(files, this, false);
}
