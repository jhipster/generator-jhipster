(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .constant('errorConstants', (function() {
            var problemBaseUrl = 'http://www.jhipster.tech/problem';
            return {
                EMAIL_ALREADY_USED_TYPE: problemBaseUrl + '/email-already-used',
                LOGIN_ALREADY_USED_TYPE: problemBaseUrl + '/login-already-used',
                EMAIL_NOT_FOUND_TYPE: problemBaseUrl + '/email-not-found'
            }
        })());
})();
