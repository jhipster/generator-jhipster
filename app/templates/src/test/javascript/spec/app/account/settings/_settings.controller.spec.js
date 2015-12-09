'use strict';

describe('Controllers Tests ', function() {

    beforeEach(mockApiAccountCall);
    beforeEach(mockI18nCalls);

    describe('SettingsController', function() {

        var $scope, $q; // actual implementations
        var MockPrincipal, MockAuth; // mocks
        var createController; // local utility functions

        beforeEach(inject(function($injector) {
            $q = $injector.get('$q');
            $scope = $injector.get("$rootScope").$new();
            MockAuth = jasmine.createSpyObj('MockAuth', ['updateAccount']);
            MockPrincipal = jasmine.createSpyObj('MockPrincipal', ['identity']);
            var locals = {
                '$scope': $scope,
                'Principal': MockPrincipal,
                'Auth': MockAuth
            };
            createController = function() {
                $injector.get('$controller')('SettingsController', locals);
            }
        }));

        it('should send the current identity upon save', function() {
            //GIVEN
            var accountValues = {
                firstName: "John",
                lastName: "Doe",

                activated: true,
                email: "john.doe@mail.com",
                langKey: "en",
                login: "john"
            };
            MockPrincipal.identity.and.returnValue($q.resolve(accountValues));
            MockAuth.updateAccount.and.returnValue($q.resolve());
            $scope.$apply(createController);

            //WHEN
            $scope.save();

            //THEN
            expect(MockPrincipal.identity).toHaveBeenCalled();
            expect(MockAuth.updateAccount).toHaveBeenCalledWith(accountValues);
            expect($scope.settingsAccount).toEqual(accountValues);
        });

        it('should notify of success upon successful save', function() {
            //GIVEN
            var accountValues = {
                firstName: "John",
                lastName: "Doe"
            };
            MockPrincipal.identity.and.returnValue($q.resolve(accountValues));
            MockAuth.updateAccount.and.returnValue($q.resolve());
            createController();

            //WHEN
            $scope.$apply($scope.save);

            //THEN
            expect($scope.error).toBeNull();
            expect($scope.success).toBe('OK');
        });

        it('should notify of error upon failed save', function() {
            //GIVEN
            MockPrincipal.identity.and.returnValue($q.resolve({}));
            MockAuth.updateAccount.and.returnValue($q.reject());
            createController();

            //WHEN
            $scope.$apply($scope.save);

            //THEN
            expect($scope.error).toEqual('ERROR');
            expect($scope.success).toBeNull();
        });
    });
});
