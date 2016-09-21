import { Register } from './register/register.service';
import { Activate } from './activate/activate.service';
import { Password } from './password/password.service';
import { PasswordResetInit } from './password-reset/init/password-reset-init.service';
import { PasswordResetFinish } from './password-reset/finish/password-reset-finish.service';

import { PasswordStrengthBarComponent} from "./password/password-strength-bar.component";
import { upgradeAdapter } from "../upgrade_adapter";

import { RegisterStateConfig } from "./register/register.state";
import { ActivateStateConfig } from "./activate/activate.state";
import { AccountStateConfig } from "./account.state";
import { PasswordStateConfig } from "./password/password.state";
import { PasswordResetInitStateConfig } from "./password-reset/init/password-reset-init.state";
import { PasswordResetFinishStateConfig } from "./password-reset/finish/password-reset-finish.state";
import { SettingsStateConfig } from "./settings/settings.state"

import { RegisterComponent } from "./register/register.component";
import { ActivateComponent } from "./activate/activate.component";
import { PasswordComponent } from "./password/password.component";
import { PasswordResetInitComponent } from "./password-reset/init/password-reset-init.component";
import { PasswordResetFinishComponent } from "./password-reset/finish/password-reset-finish.component";
import { SettingsComponent } from "./settings/settings.component"

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
    .config(ActivateStateConfig)
    .config(RegisterStateConfig)
    .config(PasswordStateConfig)
    .config(PasswordResetInitStateConfig)
    .config(PasswordResetFinishStateConfig)
    .config(SettingsStateConfig)
    .directive('passwordStrengthBar', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordStrengthBarComponent))
    .directive('jhiRegister', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(RegisterComponent))
    .directive('activate', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(ActivateComponent))
    .directive('password', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordComponent))
    .directive('passwordResetInit', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordResetInitComponent))
    .directive('passwordResetFinish', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PasswordResetFinishComponent))
    .directive('settings', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(SettingsComponent))
    .factory('Register', Register)
    .factory('Activate', Activate)
    //.factory('Activate', upgradeAdapter.downgradeNg2Provider(Activate))
    .factory('Password', Password)
    .factory('PasswordResetInit', PasswordResetInit)
    .factory('PasswordResetFinish', PasswordResetFinish);
