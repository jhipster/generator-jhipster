'use strict';

describe('Controllers Tests ', function () {

    beforeEach(module('<%= angularAppName %>'));

    describe('SessionsController', function () {
        var $scope, SessionsService;

        beforeEach(inject(function ($rootScope, $controller, Sessions) {
            $scope = $rootScope.$new();

            SessionsService = Sessions;
            $controller('SessionsController',{$scope:$scope, Sessions:SessionsService});
        }));

        it('should invalidate session', function () {
            //GIVEN
            $scope.series = "123456789";

            //SET SPY
            spyOn(SessionsService, 'delete');

            //WHEN
            $scope.invalidate($scope.series);

            //THEN
            expect(SessionsService.delete).toHaveBeenCalled();
            expect(SessionsService.delete).toHaveBeenCalledWith({series: "123456789"}, jasmine.any(Function), jasmine.any(Function));

            //SIMULATE SUCCESS CALLBACK CALL FROM SERVICE
            SessionsService.delete.calls.mostRecent().args[1]();
            expect($scope.error).toBeNull();
            expect($scope.success).toBe('OK');
        });
    });
});
