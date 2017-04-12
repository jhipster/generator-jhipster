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
        .directive('hasAuthority', hasAuthority);

    hasAuthority.$inject = ['Principal'];

    function hasAuthority(Principal) {
        var directive = {
            restrict: 'A',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, element, attrs) {
            var authority = attrs.hasAuthority.replace(/\s+/g, '');

            var setVisible = function () {
                    element.removeClass('hidden');
                },
                setHidden = function () {
                    element.addClass('hidden');
                },
                defineVisibility = function (reset) {

                    if (reset) {
                        setVisible();
                    }

                    Principal.hasAuthority(authority)
                        .then(function (result) {
                            if (result) {
                                setVisible();
                            } else {
                                setHidden();
                            }
                        });
                };

            if (authority.length > 0) {
                defineVisibility(true);

                scope.$watch(function() {
                    return Principal.isAuthenticated();
                }, function() {
                    defineVisibility(true);
                });
            }
        }
    }
})();
