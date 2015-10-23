'use strict';

describe('<%= entityClass %> Detail Controller', function() {
    var $scope, $rootScope;
    var MockEntity<% for (idx in differentTypes) { %>, Mock<%= differentTypes[idx] %><%}%>;
    var createController;

    beforeEach(inject(function($injector) {
        $rootScope = $injector.get('$rootScope');
        $scope = $rootScope.$new();
        MockEntity = jasmine.createSpy('MockEntity');
        <% for (idx in differentTypes) { %>Mock<%= differentTypes[idx] %> = jasmine.createSpy('Mock<%= differentTypes[idx] %>');
        <%}%>

        var locals = {
            '$scope': $scope,
            '$rootScope': $rootScope,
            'entity': MockEntity <% for (idx in differentTypes) { %>,
            '<%= differentTypes[idx] %>': Mock<%= differentTypes[idx] %><% } %>
        };
        createController = function() {
            $injector.get('$controller')("<%= entityClass %>DetailController", locals);
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
