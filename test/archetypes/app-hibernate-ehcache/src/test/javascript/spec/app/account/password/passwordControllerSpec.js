'use strict';

describe('Controllers Tests ', function () {

    beforeEach(module('jhipsterApp'));

    var $scope, $httpBackend, q, Auth;

    // define the mock Auth service
    beforeEach(function() {
        Auth = {
            changePassword: function() {}
        };
    });

    beforeEach(inject(function ($rootScope, $controller, $q, $injector) {
        $scope = $rootScope.$new();
        q = $q;
        $httpBackend = $injector.get('$httpBackend');
        $controller('PasswordController', {$scope: $scope, Auth: Auth});
    }));

    describe('PasswordController', function () {
        it('should show error if passwords do not match', function () {
            //GIVEN
            $scope.password = 'password1';
            $scope.confirmPassword = 'password2';
            //WHEN
            $scope.changePassword();
            //THEN
            expect($scope.doNotMatch).toBe('ERROR');
        });
        it('should call Service and set OK on Success', function () {
            //GIVEN
            var pass = 'myPassword';
            $scope.password = pass;
            $scope.confirmPassword = pass;

            spyOn(Auth, 'changePassword').and.returnValue(new function(){
                var deferred = q.defer();
                $scope.error = null;
                $scope.success = 'OK';
                return deferred.promise;
            });

            //WHEN
            $scope.changePassword();

            //THEN
            expect($scope.error).toBeNull();
            expect($scope.success).toBe('OK');
        });
    });
});
