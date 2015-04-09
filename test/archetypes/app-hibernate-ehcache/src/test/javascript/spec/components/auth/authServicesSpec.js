'use strict';

describe('Services Tests ', function () {

    beforeEach(module('jhipsterApp'));

    describe('Auth', function () {
        var $httpBackend, spiedLocalStorageService, authService, spiedAuthServerProvider;

        beforeEach(inject(function($injector, localStorageService, Auth, AuthServerProvider) {
            $httpBackend = $injector.get('$httpBackend');
            spiedLocalStorageService = localStorageService;
            authService = Auth;
            spiedAuthServerProvider = AuthServerProvider;
            //Request on app init

            $httpBackend.expectGET('i18n/en/global.json').respond(200, '');
            $httpBackend.expectGET('i18n/en/language.json').respond(200, '');
            $httpBackend.expectGET('scripts/components/navbar/navbar.html').respond({});
            $httpBackend.expectGET('i18n/en/global.json').respond(200, '');
            $httpBackend.expectGET('i18n/en/language.json').respond(200, '');
            $httpBackend.expectGET('i18n/en/main.json').respond(200, '');
            $httpBackend.expectGET('scripts/app/main/main.html').respond({});
            
          }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        

    });
});
