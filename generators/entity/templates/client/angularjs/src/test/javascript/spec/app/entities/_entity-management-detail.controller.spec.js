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
'use strict';

describe('Controller Tests', function() {

    describe('<%= entityClass %> Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState<% for (idx in differentTypes) { %>, Mock<%= differentTypes[idx] %><%}%>;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            <% for (idx in differentTypes) { %>Mock<%= differentTypes[idx] %> = jasmine.createSpy('Mock<%= differentTypes[idx] %>');
            <%}%>

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState<% for (idx in differentTypes) { %>,
                '<%= differentTypes[idx] %>': Mock<%= differentTypes[idx] %><% } %>
            };
            createController = function() {
                $injector.get('$controller')("<%= entityAngularName %>DetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = '<%=angularAppName%>:<%= entityInstance %>Update';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});
