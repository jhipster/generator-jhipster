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
const utils = require('./utils');

module.exports = {
    writeFiles
};

function writeFiles() {
    // Dependency management files
    this.template('package.json.ejs', 'package.json');
    this.template('package-lock.json.ejs', 'package-lock.json');
    this.template('tsconfig.json.ejs', 'tsconfig.json');

    this.copy('.babelrc', '.babelrc');
    this.copy('.postcssrc.js', '.postcssrc.js');
    this.copy('.eslintrc.json', '.eslintrc.json');

    // Config files
    this.copy('config/index.js', 'config/index.js');
    this.copy('config/dev.env.js', 'config/dev.env.js');
    this.copy('config/prod.env.js', 'config/prod.env.js');

    // Webpack config files
    this.copy('webpack/vue.utils.js', 'webpack/vue.utils.js');
    this.template('webpack/utils.js.ejs', 'webpack/utils.js');
    this.copy('webpack/loader.conf.js', 'webpack/loader.conf.js');
    this.copy('webpack/webpack.common.js', 'webpack/webpack.common.js');
    this.template('webpack/webpack.dev.js.ejs', 'webpack/webpack.dev.js');
    this.copy('webpack/webpack.prod.js', 'webpack/webpack.prod.js');

    // App files
    this.copy('webapp/index.html', 'src/main/webapp/index.html');
    this.copy('webapp/app/App.vue', 'src/main/webapp/app/App.vue');
    this.copy('webapp/app/shims-vue.d.ts', 'src/main/webapp/app/shims-vue.d.ts');
    this.copy('webapp/app/constants.js', 'src/main/webapp/app/constants.js');
    this.template('webapp/app/main.ts.ejs', 'src/main/webapp/app/main.ts');
    this.copy('webapp/app/shared/config.js', 'src/main/webapp/app/shared/config.js');
    this.copy('webapp/app/router/index.js', 'src/main/webapp/app/router/index.js');
    this.copy('webapp/app/locale/LanguageService.vue', 'src/main/webapp/app/locale/LanguageService.vue');
    this.copy('webapp/app/locale/TranslationService.vue', 'src/main/webapp/app/locale/TranslationService.vue');
    this.copy('webapp/app/components/Home.vue', 'src/main/webapp/app/components/Home.vue');
    this.copy('webapp/app/components/JhiFooter.vue', 'src/main/webapp/app/components/JhiFooter.vue');
    this.template('webapp/app/components/JhiNavBar.vue.ejs', 'src/main/webapp/app/components/JhiNavBar.vue');
    this.copy('webapp/app/components/Ribbon.vue', 'src/main/webapp/app/components/Ribbon.vue');
    this.copy('webapp/app/components/account/ChangePassword.vue', 'src/main/webapp/app/components/account/ChangePassword.vue');
    this.template('webapp/app/components/account/LoginForm.vue.ejs', 'src/main/webapp/app/components/account/LoginForm.vue');
    this.copy('webapp/app/components/account/LoginModalService.vue', 'src/main/webapp/app/components/account/LoginModalService.vue');
    this.template('webapp/app/components/account/Principal.vue.ejs', 'src/main/webapp/app/components/account/Principal.vue');
    this.copy('webapp/app/components/account/register/Register.vue', 'src/main/webapp/app/components/account/register/Register.vue');
    this.copy('webapp/app/components/account/register/Register.component.ts', 'src/main/webapp/app/components/account/register/Register.component.ts');
    this.copy('webapp/app/components/account/RegisterService.vue', 'src/main/webapp/app/components/account/RegisterService.vue');
    this.copy('webapp/app/components/account/ResetPassword.vue', 'src/main/webapp/app/components/account/ResetPassword.vue');
    this.copy('webapp/app/components/account/Sessions.vue', 'src/main/webapp/app/components/account/Sessions.vue');
    this.copy('webapp/app/components/account/Settings.vue', 'src/main/webapp/app/components/account/Settings.vue');
    this.copy('webapp/app/shared/date/filters.js', 'src/main/webapp/app/shared/date/filters.js');
    this.template('webapp/app/config/axios-interceptor.js.ejs', 'src/main/webapp/app/config/axios-interceptor.js');

    // Specs tests
    this.copy('webapp/app/components/account/specs/settings.component.test.js', 'src/main/webapp/app/components/account/specs/settings.component.test.js');
    this.copy('webapp/app/components/account/specs/change-password.component.test.js', 'src/main/webapp/app/components/account/specs/change-password.component.test.js');

    utils.addLanguagesToApplication(this);
    utils.addLanguagesToWebPackConfiguration(this);

    if (!this.enableTranslation) {
        utils.replaceTranslation(this, ['app/App.vue',
            'app/components/Home.vue',
            'app/components/JhiFooter.vue',
            'app/components/JhiNavBar.vue',
            'app/components/Ribbon.vue',
            'app/components/account/ChangePassword.vue',
            'app/components/account/LoginForm.vue',
            'app/components/account/register/Register.vue',
            'app/components/account/ResetPassword.vue',
            'app/components/account/Sessions.vue',
            'app/components/account/Settings.vue',
        ]);
    }
}
