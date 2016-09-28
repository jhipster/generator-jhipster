import * as angular from 'angular';

import { upgradeAdapter } from '../upgrade_adapter';

import {
    Register,
    Activate,
    Password,
    PasswordResetInit,
    PasswordResetFinish,
    <%_ if (authenticationType === 'session') { _%>
    SessionsService,
    SessionsComponent,
    <%_ } _%>
    PasswordStrengthBarComponent,
    RegisterComponent,
    ActivateComponent,
    PasswordComponent,
    PasswordResetInitComponent,
    PasswordResetFinishComponent,
    SettingsComponent
} from './';

import {<%=jhiPrefixCapitalized%>LoginModalComponent} from "../components/login/login.component";

<% if (enableTranslation) { %>upgradeAdapter.upgradeNg1Provider('$translate');<% } %>
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
    .directive('<%=jhiPrefix%>LoginModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>LoginModalComponent))
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
