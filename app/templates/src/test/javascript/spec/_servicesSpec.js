'use strict';

describe('Services Tests ', function () {

    beforeEach(module('<%= angularAppName %>'));

    describe('AuthenticationSharedService', function () {
        var serviceTested,
            httpBackend,
            authServiceSpied;

        beforeEach(inject(function($httpBackend, AuthenticationSharedService, authService) {
            serviceTested = AuthenticationSharedService;
            httpBackend = $httpBackend;
            authServiceSpied = authService;
            //Request on app init
            httpBackend.expectGET('i18n/en.json').respond(200, '');
        }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should call backend on logout then call authService.loginCancelled', function(){
            //GIVEN
            //set up some data for the http call to return and test later.
            var returnData = { result: 'ok' };
            //expectGET to make sure this is called once.
            httpBackend.expectGET('app/logout').respond(returnData);<% if (websocket == 'atmosphere') { %>
            // WebSocket tries to authenticate after logout
            httpBackend.expectGET('protected/authentication_check.gif').respond(401, '');
            httpBackend.expectGET('views/main.html').respond(401, '');<% } %>

            //Set spy
            spyOn(authServiceSpied, 'loginCancelled');

             //WHEN
            serviceTested.logout();
            //flush the backend to "execute" the request to do the expectedGET assertion.
            httpBackend.flush();

            //THEN
            expect(authServiceSpied.loginCancelled).toHaveBeenCalled();
        });

    });
});
