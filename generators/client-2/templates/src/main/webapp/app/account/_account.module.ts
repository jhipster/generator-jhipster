import { Register } from './register/register.service';
import { Activate } from './activate/activate.service';
import { Password } from './password/password.service';
import { PasswordResetInit } from './reset/request/reset-request.service';
import { PasswordResetFinish } from './reset/finish/reset-finish.service';

angular
    .module('<%=angularAppName%>.account', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    .factory('Register', Register)
    .factory('Activate', Activate)
    .factory('Password', Password)
    .factory('PasswordResetInit', PasswordResetInit)
    .factory('PasswordResetFinish', PasswordResetFinish);
