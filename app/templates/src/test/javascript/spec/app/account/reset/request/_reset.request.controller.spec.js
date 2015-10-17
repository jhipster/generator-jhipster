'use strict';

describe('Controller Tests', function() {

    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    describe('RequestResetController', function() {

        var $rootScope, $scope, $q; // actual implementations
        var MockState, MockTimeout, MockAuth; // mocks
        var createController; // local utility function

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockState = jasmine.createSpy('MockState');
            MockTimeout = jasmine.createSpy('MockTimeout');
            MockAuth = jasmine.createSpyObj('MockAuth', ['resetPasswordInit']);

            var locals = {
                '$rootScope': $rootScope,
                '$scope': $scope,
                '$state': MockState,
                '$timeout': MockTimeout,
                'Auth': MockAuth
            };
            createController = function() {
                return $injector.get('$controller')('RequestResetController', locals);
            };
        }));

        it('should define its initial state', function() {
            // given
            createController();

            // then
            expect($scope.success).toBeNull();
            expect($scope.error).toBeNull();
            expect($scope.errorEmailNotExists).toBeNull();
            expect($scope.resetAccount).toEqual({});
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
            expect(MockAngular.element).toHaveBeenCalledWith('[ng-model="resetAccount.email"]');
            expect(MockElement.focus).toHaveBeenCalled();
        });

        it('notifies of success upon successful requestReset', function() {
            // given
            MockAuth.resetPasswordInit.and.returnValue($q.resolve());
            createController();
            $scope.resetAccount.email = 'user@domain.com';
            // when
            $scope.$apply($scope.requestReset);
            // then
            expect(MockAuth.resetPasswordInit).toHaveBeenCalledWith('user@domain.com');
            expect($scope.success).toEqual('OK');
            expect($scope.error).toBeNull();
            expect($scope.errorEmailNotExists).toBeNull();
        });
        it('notifies of unknown email upon e-mail address not registered/400', function() {
            // given
            MockAuth.resetPasswordInit.and.returnValue($q.reject({
                status: 400,
                data: 'e-mail address not registered'
            }));
            createController();
            $scope.resetAccount.email = 'user@domain.com';
            // when
            $scope.$apply($scope.requestReset);
            // then
            expect(MockAuth.resetPasswordInit).toHaveBeenCalledWith('user@domain.com');
            expect($scope.success).toBeNull();
            expect($scope.error).toBeNull();
            expect($scope.errorEmailNotExists).toEqual('ERROR');
        });

        it('notifies of error upon error response', function() {
            // given
            MockAuth.resetPasswordInit.and.returnValue($q.reject({
                status: 503,
                data: 'something else'
            }));
            createController();
            $scope.resetAccount.email = 'user@domain.com';
            // when
            $scope.$apply($scope.requestReset);
            // then
            expect(MockAuth.resetPasswordInit).toHaveBeenCalledWith('user@domain.com');
            expect($scope.success).toBeNull();
            expect($scope.errorEmailNotExists).toBeNull();
            expect($scope.error).toEqual('ERROR');
        });

    });
});
