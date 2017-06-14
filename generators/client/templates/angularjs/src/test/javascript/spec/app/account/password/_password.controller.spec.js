<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
                $injector.get('$controller')('PasswordController as vm', locals);
            }
        }));

        it('should show error if passwords do not match', function() {
            //GIVEN
            createController();
            $scope.vm.password = 'password1';
            $scope.vm.confirmPassword = 'password2';
            //WHEN
            $scope.vm.changePassword();
            //THEN
            expect($scope.vm.doNotMatch).toBe('ERROR');
            expect($scope.vm.error).toBeNull();
            expect($scope.vm.success).toBeNull();
        });
        it('should call Auth.changePassword when passwords match', function() {
            //GIVEN
            MockAuth.changePassword.and.returnValue($q.resolve());
            createController();
            $scope.vm.password = $scope.vm.confirmPassword = 'myPassword';

            //WHEN
            $scope.$apply($scope.vm.changePassword);

            //THEN
            expect(MockAuth.changePassword).toHaveBeenCalledWith('myPassword');
        });

        it('should set success to OK upon success', function() {
            //GIVEN
            MockAuth.changePassword.and.returnValue($q.resolve());
            createController();
            $scope.vm.password = $scope.vm.confirmPassword = 'myPassword';

            //WHEN
            $scope.$apply($scope.vm.changePassword);

            //THEN
            expect($scope.vm.doNotMatch).toBeNull();
            expect($scope.vm.error).toBeNull();
            expect($scope.vm.success).toBe('OK');
        });

        it('should notify of error if change password fails', function() {
            //GIVEN
            MockAuth.changePassword.and.returnValue($q.reject());
            createController();
            $scope.vm.password = $scope.vm.confirmPassword = 'myPassword';

            //WHEN
            $scope.$apply($scope.vm.changePassword);

            //THEN
            expect($scope.vm.doNotMatch).toBeNull();
            expect($scope.vm.success).toBeNull();
            expect($scope.vm.error).toBe('ERROR');
        });
    });
});
