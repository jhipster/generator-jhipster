'use strict';

describe('Controllers Tests ', function() {

    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    describe('RegisterController', function() {

        var $scope, $q; // actual implementations
        var MockTimeout, MockTranslate, MockAuth; // mocks
        var createController; // local utility function

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $scope = $injector.get('$rootScope').$new();
            MockTimeout = jasmine.createSpy('MockTimeout');
            MockAuth = jasmine.createSpyObj('MockAuth', ['createAccount']);
            MockTranslate = jasmine.createSpyObj('MockTranslate', ['use']);

            var locals = {
                'Auth': MockAuth,
                '$translate': MockTranslate,
                '$timeout': MockTimeout,
                '$scope': $scope,
            };
            createController = function() {
                $injector.get('$controller')('RegisterController', locals);
            };
        }));

        it('should ensure the two passwords entered match', function() {
            // given
            createController();
            $scope.registerAccount.password = 'password';
            $scope.confirmPassword = 'non-matching';
            // when
            $scope.register();
            // then
            expect($scope.doNotMatch).toEqual('ERROR');
        });

        it('should update success to OK after creating an account', function() {
            // given
            MockTranslate.use.and.returnValue('en');
            MockAuth.createAccount.and.returnValue($q.resolve());
            createController();
            $scope.registerAccount.password = $scope.confirmPassword = 'password';
            // when
            $scope.$apply($scope.register); // $q promises require an $apply
            // then
            expect(MockAuth.createAccount).toHaveBeenCalledWith({
                password: 'password',
                langKey: 'en'
            });
            expect($scope.success).toEqual('OK');
            expect($scope.registerAccount.langKey).toEqual('en');
            expect(MockTranslate.use).toHaveBeenCalled();
            expect($scope.errorUserExists).toBeNull();
            expect($scope.errorEmailExists).toBeNull();
            expect($scope.error).toBeNull();
        });

        it('should notify of user existence upon 400/login already in use', function() {
            // given
            MockAuth.createAccount.and.returnValue($q.reject({
                status: 400,
                data: 'login already in use'
            }));
            createController();
            $scope.registerAccount.password = $scope.confirmPassword = 'password';
            // when
            $scope.$apply($scope.register); // $q promises require an $apply
            // then
            expect($scope.errorUserExists).toEqual('ERROR');
            expect($scope.errorEmailExists).toBeNull();
            expect($scope.error).toBeNull();
        });

        it('should notify of email existence upon 400/e-mail address already in use', function() {
            // given
            MockAuth.createAccount.and.returnValue($q.reject({
                status: 400,
                data: 'e-mail address already in use'
            }));
            createController();
            $scope.registerAccount.password = $scope.confirmPassword = 'password';
            // when
            $scope.$apply($scope.register); // $q promises require an $apply
            // then
            expect($scope.errorEmailExists).toEqual('ERROR');
            expect($scope.errorUserExists).toBeNull();
            expect($scope.error).toBeNull();
        });

        it('should notify of generic error', function() {
            // given
            MockAuth.createAccount.and.returnValue($q.reject({
                status: 503
            }));
            createController();
            $scope.registerAccount.password = $scope.confirmPassword = 'password';
            // when
            $scope.$apply($scope.register); // $q promises require an $apply
            // then
            expect($scope.errorUserExists).toBeNull();
            expect($scope.errorEmailExists).toBeNull();
            expect($scope.error).toEqual('ERROR');
        });

    });
});
