import { Register } from './register/register.service';
import { Activate } from './activate/activate.service';
import { Password } from './password/password.service';
import { PasswordResetInit } from './reset/request/reset-request.service';
import { PasswordResetFinish } from './reset/finish/reset-finish.service';

import { PasswordStrengthBarComponent} from "./password/password-strength-bar.component";
import { upgradeAdapter } from "../upgrade_adapter";

import { RegisterStateConfig } from "./register/register.state";
import { AccountStateConfig } from "./account.state";

import { RegisterComponent } from "./register/register.controller";

<% if (enableTranslation) { %>upgradeAdapter.upgradeNg1Provider('$translate');<% } %>
upgradeAdapter.upgradeNg1Provider('Auth');
upgradeAdapter.upgradeNg1Provider('LoginService');

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
    .controller('RegisterController', RegisterController)
    .directive('passwordStrengthBar', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordStrengthBarComponent))
    .factory('Register', Register)
    .factory('Activate', Activate)
    .factory('Password', Password)
    .factory('PasswordResetInit', PasswordResetInit)
    .factory('PasswordResetFinish', PasswordResetFinish);
