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
