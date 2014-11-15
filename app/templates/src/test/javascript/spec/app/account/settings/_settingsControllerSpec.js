'use strict';

describe('Controllers Tests ', function () {

    var $scope, q, Auth, Account;

    beforeEach(module('<%= angularAppName %>'));

    // define the mock Auth service
    beforeEach(function() {
        Auth = {
            updateAccount: function() {}
        };

        Account = {
            get: function() {},
            save: function(Account) {}
        };
    });


    describe('SettingsController', function () {

        beforeEach(inject(function ($rootScope, $controller, $q) {
            $scope = $rootScope.$new();
            q = $q;
            $controller('SettingsController',{$scope:$scope, Account:Account, Auth:Auth});
        }));

        it('should save account', function () {
            //GIVEN
            var account = {firstName: "John", lastName: "Doe"};
            $scope.settingsAccount = account;

            //SET SPY
            spyOn(Account, 'get').and.callThrough();
            spyOn(Account, 'save').and.callThrough();

            spyOn(Auth, 'updateAccount').and.returnValue(new function(){
                Account.save(account);
                var deferred = q.defer();
                $scope.error = null;
                $scope.success = 'OK';
                return deferred.promise;
            });


            //WHEN
            $scope.save();

            //THEN
            expect(Account.save).toHaveBeenCalled();
            expect(Account.save).toHaveBeenCalledWith(account);

            expect($scope.error).toBeNull();
            expect($scope.success).toBe('OK');
        });
    });
});
