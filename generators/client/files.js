
module.exports = {
    writeFiles
};


function writeFiles() {
    // Dependency management files
    this.template('package.json.ejs', 'package.json');
    this.template('package-lock.json.ejs', 'package-lock.json');

    this.copy('.babelrc', '.babelrc');
    this.copy('.postcssrc.js', '.postcssrc.js');

    // Config files
    this.copy('config/index.js', 'config/index.js');
    this.copy('config/dev.env.js', 'config/dev.env.js');
    this.copy('config/prod.env.js', 'config/prod.env.js');

    // Webpack config files
    this.copy('webpack/vue.utils.js', 'webpack/vue.utils.js');
    this.copy('webpack/loader.conf.js', 'webpack/loader.conf.js');
    this.copy('webpack/webpack.common.js', 'webpack/webpack.common.js');
    this.copy('webpack/webpack.dev.js', 'webpack/webpack.dev.js');
    this.copy('webpack/webpack.prod.js', 'webpack/webpack.prod.js');

    // App files
    this.copy('webapp/index.html', 'src/main/webapp/index.html');
    this.copy('webapp/app/App.vue', 'src/main/webapp/app/App.vue');
    this.copy('webapp/app/constants.js', 'src/main/webapp/app/constants.js');
    this.copy('webapp/app/main.js', 'src/main/webapp/app/main.js');
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
    this.copy('webapp/app/components/account/Principal.vue', 'src/main/webapp/app/components/account/Principal.vue');
    this.copy('webapp/app/components/account/Register.vue', 'src/main/webapp/app/components/account/Register.vue');
    this.copy('webapp/app/components/account/RegisterService.vue', 'src/main/webapp/app/components/account/RegisterService.vue');
    this.copy('webapp/app/components/account/ResetPassword.vue', 'src/main/webapp/app/components/account/ResetPassword.vue');
    this.copy('webapp/app/components/account/Sessions.vue', 'src/main/webapp/app/components/account/Sessions.vue');
    this.copy('webapp/app/components/account/Settings.vue', 'src/main/webapp/app/components/account/Settings.vue');
    this.template('webapp/app/config/axios-interceptor.js.ejs', 'src/main/webapp/app/config/axios-interceptor.js');
}
