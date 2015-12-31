'use strict';

describe('Service Tests', function () {
    <%_ if (authenticationType == 'session') { _%>
    beforeEach(mockApiAccountCall);
    <%_ } _%>
    <%_ if (enableTranslation) { _%>
    beforeEach(mockI18nCalls);
    <%_ } _%>
    beforeEach(mockScriptsCalls);

    describe('Auth', function () {
        var $httpBackend, spiedLocalStorageService, authService, spiedAuthServerProvider;

        beforeEach(inject(function($injector, localStorageService, Auth, AuthServerProvider) {
            $httpBackend = $injector.get('$httpBackend');
            spiedLocalStorageService = localStorageService;
            authService = Auth;
            spiedAuthServerProvider = AuthServerProvider;

            <%_ if (authenticationType == 'session' || authenticationType == 'oauth2') { _%>
            $httpBackend.expectPOST(/api\/logout\?cacheBuster=\d+/).respond(200, '');
            <%_ } _%>
        }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        <% if (authenticationType == 'session' || authenticationType == 'oauth2') { %>
        it('should call backend on logout then call authServerProvider.logout', function(){
            //GIVEN
            //Set spy
            spyOn(spiedAuthServerProvider, 'logout').and.callThrough();
            spyOn(spiedLocalStorageService, "clearAll").and.callThrough();

            //WHEN
            authService.logout();
            //flush the backend to "execute" the request to do the expectedGET assertion.
            $httpBackend.flush();

            //THEN
            expect(spiedAuthServerProvider.logout).toHaveBeenCalled();
            expect(spiedLocalStorageService.clearAll).toHaveBeenCalled();
        });<% } %><% if (authenticationType == 'xauth') { %>
          it('should call LocalStorageService.clearAll on logout', function(){
            //GIVEN
            //Set spy
            spyOn(spiedLocalStorageService, "clearAll").and.callThrough();

            //WHEN
            authService.logout();
            //flush the backend to "execute" the request to do the expectedGET assertion.
            $httpBackend.flush();

            //THEN
            expect(spiedLocalStorageService.clearAll).toHaveBeenCalled();
          });<% } %>

    });
});
