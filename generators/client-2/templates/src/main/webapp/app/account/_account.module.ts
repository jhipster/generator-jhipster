import { Register } from './register/register.service';
import { Activate } from './activate/activate.service';
import { Password } from './password/password.service';
import { PasswordResetInit } from './reset/request/reset-request.service';
import { PasswordResetFinish } from './reset/finish/reset-finish.service';

import { PasswordStrengthBarComponent} from "./password/password-strength-bar.component";
import { upgradeAdapter } from "../upgrade_adapter";

import { RegisterStateConfig } from "./register/register.state";
import { AccountStateConfig } from "./account.state";
import { PasswordStateConfig } from "./password/password.state";
import { PasswordResetInitStateConfig } from "./reset/request/reset-request.state";
import { PasswordResetFinishStateConfig } from "./reset/finish/reset-finish.state";

import { RegisterComponent } from "./register/register.component";
import { PasswordComponent } from "./password/password.component";
import { PasswordResetInitComponent } from "./reset/request/reset-request.component";
import { PasswordResetFinishComponent } from "./reset/finish/reset-finish.component";

<% if (enableTranslation) { %>upgradeAdapter.upgradeNg1Provider('$translate');<% } %>
upgradeAdapter.upgradeNg1Provider('Auth');
upgradeAdapter.upgradeNg1Provider('LoginService');
upgradeAdapter.upgradeNg1Provider('$stateParams');

angular
    .module('<%=angularAppName%>.account', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    .config(AccountStateConfig)
    .config(RegisterStateConfig)
    .config(PasswordStateConfig)
    .config(PasswordResetInitStateConfig)
    .config(PasswordResetFinishStateConfig)
    .directive('passwordStrengthBar', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordStrengthBarComponent))
    .directive('jhiRegister', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(RegisterComponent))
    .directive('password', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordComponent))
    .directive('passwordResetInit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordResetInitComponent))
    .directive('passwordResetFinish', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordResetFinishComponent))
    .factory('Register', Register)
    .factory('Activate', Activate)
    .factory('Password', Password)
    .factory('PasswordResetInit', PasswordResetInit)
    .factory('PasswordResetFinish', PasswordResetFinish);
