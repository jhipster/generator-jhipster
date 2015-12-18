'use strict';

describe('Controllers Tests ', function() {
    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    describe('PasswordController', function() {

        var $scope, $httpBackend, $q;
        var MockAuth;
        var createController;

        beforeEach(inject(function($injector) {
            $scope = $injector.get('$rootScope').$new();
            $q = $injector.get('$q');
            $httpBackend = $injector.get('$httpBackend');

            MockAuth = jasmine.createSpyObj('MockAuth', ['changePassword']);
            var locals = {
                '$scope': $scope,
                'Auth': MockAuth
            };
            createController = function() {
                $injector.get('$controller')('PasswordController', locals);
            }
        }));

        it('should show error if passwords do not match', function() {
            //GIVEN
            createController();
            $scope.password = 'password1';
            $scope.confirmPassword = 'password2';
            //WHEN
            $scope.changePassword();
            //THEN
            expect($scope.doNotMatch).toBe('ERROR');
            expect($scope.error).toBeNull();
            expect($scope.success).toBeNull();
        });
        it('should call Auth.changePassword when passwords match', function() {
            //GIVEN
            MockAuth.changePassword.and.returnValue($q.resolve());
            createController();
            $scope.password = $scope.confirmPassword = 'myPassword';

            //WHEN
            $scope.$apply($scope.changePassword);

            //THEN
            expect(MockAuth.changePassword).toHaveBeenCalledWith('myPassword');
        });

        it('should set success to OK upon success', function() {
            //GIVEN
            MockAuth.changePassword.and.returnValue($q.resolve());
            createController();
            $scope.password = $scope.confirmPassword = 'myPassword';

            //WHEN
            $scope.$apply($scope.changePassword);

            //THEN
            expect($scope.doNotMatch).toBeNull();
            expect($scope.error).toBeNull();
            expect($scope.success).toBe('OK');
        });

        it('should notify of error if change password fails', function() {
            //GIVEN
            MockAuth.changePassword.and.returnValue($q.reject());
            createController();
            $scope.password = $scope.confirmPassword = 'myPassword';

            //WHEN
            $scope.$apply($scope.changePassword);

            //THEN
            expect($scope.doNotMatch).toBeNull();
            expect($scope.success).toBeNull();
            expect($scope.error).toBe('ERROR');
        });
    });
});
