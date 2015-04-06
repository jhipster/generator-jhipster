'use strict';

describe('Controllers Tests ', function () {

    beforeEach(module('jhipsterApp'));

    var $scope, q, Principal, Auth;

    // define the mock Auth service
    beforeEach(function() {
        Auth = {
            updateAccount: function() {}
        };

        Principal = {
            identity: function() {
                var deferred = q.defer();
                return deferred.promise;
            }
        };
    });


    describe('SettingsController', function () {

        beforeEach(inject(function ($rootScope, $controller, $q) {
            $scope = $rootScope.$new();
            q = $q;
            $controller('SettingsController',{$scope:$scope, Principal:Principal, Auth:Auth});
        }));

        it('should save account', function () {
            //GIVEN
            var account = {firstName: "John", lastName: "Doe"};
            $scope.settingsAccount = account;

            //SET SPY
            spyOn(Principal, 'identity').and.callThrough();

            spyOn(Auth, 'updateAccount').and.returnValue(new function(){
                var deferred = q.defer();
                $scope.error = null;
                $scope.success = 'OK';
                return deferred.promise;
            });


            //WHEN
            $scope.save();

            //THEN
            expect($scope.error).toBeNull();
            expect($scope.success).toBe('OK');
        });
    });
});
