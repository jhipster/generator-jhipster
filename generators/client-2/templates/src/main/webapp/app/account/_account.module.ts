import * as angular from 'angular';

import { Register } from './register/register.service';
import { Activate } from './activate/activate.service';
import { Password } from './password/password.service';
import { PasswordResetInit } from './password-reset/init/password-reset-init.service';
import { PasswordResetFinish } from './password-reset/finish/password-reset-finish.service';
<%_ if (authenticationType === 'session') { _%>
import { SessionsService } from './sessions/sessions.service';
<%_ } _%>

import { PasswordStrengthBarComponent} from './password/password-strength-bar.component';
import { upgradeAdapter } from '../upgrade_adapter';


import { RegisterComponent } from './register/register.component';
import { ActivateComponent } from './activate/activate.component';
import { PasswordComponent } from './password/password.component';
import { PasswordResetInitComponent } from './password-reset/init/password-reset-init.component';
import { PasswordResetFinishComponent } from './password-reset/finish/password-reset-finish.component';
<%_ if (authenticationType === 'session') { _%>
import { SessionsComponent } from './sessions/sessions.component';
<%_ } _%>
import { SettingsComponent } from './settings/settings.component';

<% if (enableTranslation) { %>upgradeAdapter.upgradeNg1Provider('$translate');<% } %>
upgradeAdapter.upgradeNg1Provider('LoginService');
upgradeAdapter.upgradeNg1Provider('$stateParams');

angular
    .module('<%=angularAppName%>.account', [
        'ngStorage',
        <%_ if (enableTranslation) { _%>
        'tmh.dynamicLocale',
        'pascalprecht.translate',
        <%_ } _%>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    .directive('passwordStrengthBar', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordStrengthBarComponent))
    .directive('jhiRegister', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(RegisterComponent))
    .directive('activate', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(ActivateComponent))
    .directive('password', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordComponent))
    .directive('passwordResetInit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordResetInitComponent))
    .directive('passwordResetFinish', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordResetFinishComponent))
    <%_ if (authenticationType === 'session') { _%>
    .directive('sessions', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(SessionsComponent))
    <%_ } _%>
    .directive('settings', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(SettingsComponent))
    .factory('Register', upgradeAdapter.downgradeNg2Provider(Register))
    .factory('Activate', upgradeAdapter.downgradeNg2Provider(Activate))
    .factory('Password',upgradeAdapter.downgradeNg2Provider( Password))
    .factory('PasswordResetInit', upgradeAdapter.downgradeNg2Provider(PasswordResetInit))
    <%_ if (authenticationType === 'session') { _%>
    .factory('SessionsService', upgradeAdapter.downgradeNg2Provider(SessionsService))
    <%_ } _%>
    .factory('PasswordResetFinish', upgradeAdapter.downgradeNg2Provider(PasswordResetFinish));
