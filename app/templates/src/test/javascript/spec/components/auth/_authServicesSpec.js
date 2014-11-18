'use strict';

describe('Services Tests ', function () {

    beforeEach(module('<%= angularAppName %>'));

    describe('Auth', function () {
        var httpBackend, spiedLocalStorageService, authService, spiedAuthServerProvider;

        beforeEach(inject(function($httpBackend, localStorageService, Auth, AuthServerProvider) {
            httpBackend = $httpBackend;
            spiedLocalStorageService = localStorageService;
            authService = Auth;
            spiedAuthServerProvider = AuthServerProvider;
            //Request on app init
            httpBackend.expectGET('i18n/en.json').respond(200, '');
        }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should call backend on logout then call authServerProvider.logout', function(){
            //GIVEN
            //set up some data for the http call to return and test later.
            var returnData = { result: 'ok' };
            //expectGET to make sure this is called once.
            httpBackend.expectGET('app/logout').respond(returnData);

            //Set spy
            spyOn(spiedAuthServerProvider, 'logout').and.callThrough();
            spyOn(spiedLocalStorageService, "clearAll").and.callThrough();

             //WHEN
            authService.logout();
            //flush the backend to "execute" the request to do the expectedGET assertion.
            httpBackend.flush();

            //THEN
            expect(spiedAuthServerProvider.logout).toHaveBeenCalled();
            expect(spiedLocalStorageService.clearAll).toHaveBeenCalled();
        });

    });
});
