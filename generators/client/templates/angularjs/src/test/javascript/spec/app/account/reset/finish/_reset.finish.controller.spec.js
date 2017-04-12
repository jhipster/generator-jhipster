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

    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    describe('ResetFinishController', function() {

        var $scope, $q; // actual implementations
        var MockStateParams, MockTimeout, MockAuth; // mocks
        var createController; // local utility function

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $scope = $injector.get('$rootScope').$new();
            MockStateParams = jasmine.createSpy('MockStateParams');

            MockTimeout = jasmine.createSpy('MockTimeout');
            MockAuth = jasmine.createSpyObj('MockAuth', ['resetPasswordInit']);

            var locals = {
                '$scope': $scope,
                '$stateParams': MockStateParams,
                '$timeout': MockTimeout,
                'Auth': MockAuth
            };
            createController = function() {
                return $injector.get('$controller')('ResetFinishController as vm', locals);
            };
        }));

        it('should define its initial state', function() {
            // given
            MockStateParams.key = 'XYZPDQ';
            createController();

            // then
            expect($scope.vm.keyMissing).toBeFalsy();

            expect($scope.vm.doNotMatch).toBeNull();
            expect($scope.vm.resetAccount).toEqual({});
        });

        it('registers a timeout handler set set focus', function() {
            // given
            var MockAngular = jasmine.createSpyObj('MockAngular', ['element']);
            var MockElement = jasmine.createSpyObj('MockElement', ['focus']);
            MockAngular.element.and.returnValue(MockElement);
            MockTimeout.and.callFake(function(callback) {
                withMockedAngular(MockAngular, callback)();
            });
            createController();

            // then
            expect(MockTimeout).toHaveBeenCalledWith(jasmine.any(Function));
            expect(MockAngular.element).toHaveBeenCalledWith('#password');
            expect(MockElement.focus).toHaveBeenCalled();
        });

    });
});
