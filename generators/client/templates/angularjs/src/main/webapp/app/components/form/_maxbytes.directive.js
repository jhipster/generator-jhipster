<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .directive('maxbytes', maxbytes);

    function maxbytes () {
        var directive = {
            restrict: 'A',
            require: '?ngModel',
            link: linkFunc
        };

        return directive;

        function linkFunc (scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            ngModel.$validators.maxbytes = function (modelValue) {
                return ngModel.$isEmpty(modelValue) || numberOfBytes(modelValue) <= attrs.maxbytes;
            };
        }

        function endsWith(suffix, str) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        function paddingSize(base64String) {
            if (endsWith('==', base64String)) {
                return 2;
            }
            if (endsWith('=', base64String)) {
                return 1;
            }
            return 0;
        }

        function numberOfBytes(base64String) {
            return base64String.length / 4 * 3 - paddingSize(base64String);
        }
    }

})();
