'use strict';

describe('<%= entityClass %> Detail Controller', function() {
  var scope, rootScope, entity, createController;

  beforeEach(module('<%=angularAppName%>'));
  beforeEach(inject(function($rootScope, $controller) {
    rootScope = $rootScope;
    scope = rootScope.$new();
    entity = jasmine.createSpyObj('entity', ['unused']);

    createController = function() {
      return $controller("<%= entityClass %>DetailController", {
        '$scope': scope,
        '$rootScope': rootScope,
        'entity': null<% for (idx in differentTypes) { %>,
        '<%= differentTypes[idx] %>' : null<% } %>
      });
    };
  }));


  describe('Root Scope Listening', function() {
    it('Unregisters root scope listener upon scope destruction',
      function() {
        var eventType = '<%=angularAppName%>:<%= entityInstance %>Update';

        createController();
        expect(rootScope.$$listenerCount[eventType]).toEqual(1);

        scope.$destroy();
        expect(rootScope.$$listenerCount[eventType]).toBeUndefined();
      });
  });
});
