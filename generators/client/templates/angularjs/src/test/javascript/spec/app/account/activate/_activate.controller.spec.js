<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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

    describe('ActivationController', function() {

        var $scope, $httpBackend, $q; // actual implementations
        var MockAuth, MockStateParams; // mocks
        var createController; // local utility function

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $scope = $injector.get('$rootScope').$new();
            $httpBackend = $injector.get('$httpBackend');
            MockAuth = jasmine.createSpyObj('MockAuth', ['activateAccount']);
            MockStateParams = jasmine.createSpy('MockStateParams');
            MockStateParams.key = 'ABC123';

            var locals = {
                '$scope': $scope,
                '$stateParams': MockStateParams,
                'Auth': MockAuth
            };
            createController = function() {
                $injector.get('$controller')('ActivationController as vm', locals);
            };
        }));

        it('calls Auth.activateAccount with the key from stateParams', function() {
            // given
            MockAuth.activateAccount.and.returnValue($q.resolve());
            // when
            $scope.$apply(createController);
            // then
            expect(MockAuth.activateAccount).toHaveBeenCalledWith({
                key: 'ABC123'
            });
        });

        it('should set set success to OK upon successful activation', function() {
            // given
            MockAuth.activateAccount.and.returnValue($q.resolve());
            // when
            $scope.$apply(createController);
            // then
            expect($scope.vm.error).toBe(null);
            expect($scope.vm.success).toEqual('OK');
        });

        it('should set set error to ERROR upon activation failure', function() {
            // given
            MockAuth.activateAccount.and.returnValue($q.reject());
            // when
            $scope.$apply(createController);
            // then
            expect($scope.vm.error).toBe('ERROR');
            expect($scope.vm.success).toEqual(null);
        });
    });
});
