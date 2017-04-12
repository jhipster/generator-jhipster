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

describe('Directive Tests', function () {
    beforeEach(mockApiAccountCall);
    <%_ if (enableTranslation) { _%>
    beforeEach(mockI18nCalls);
    <%_ } _%>

    var elm, scope, $httpBackend;

    beforeEach(inject(function($compile, $rootScope, $injector) {
        $httpBackend = $injector.get('$httpBackend');

        var html = '<password-strength-bar password-to-check="password"></password-strength-bar>';
        scope = $rootScope.$new();
        elm = angular.element(html);
        $compile(elm)(scope);
    }));

    describe('Password strength', function () {
        it("Should display the password strength bar", function() {
            expect(elm.find('ul').length).toEqual(1);
            expect(elm.find('li').length).toEqual(5);
        });

        it("Should change the first 2 points of the strength bar", function() {
            scope.$apply(function() {
                scope.password = "morethan5chars"; // that should trigger the 2 first points
            });

            var firstpointStyle = elm.find('ul').children('li')[0].getAttribute('style');
            expect(firstpointStyle).toContain('background-color: rgb(255, 153, 0)');

            var secondpointStyle = elm.find('ul').children('li')[1].getAttribute('style');
            expect(secondpointStyle).toContain('background-color: rgb(255, 153, 0)');

            var thirdpointStyle = elm.find('ul').children('li')[2].getAttribute('style');
            expect(thirdpointStyle).toContain('background-color: rgb(221, 221, 221)');
        });

        it("Should change the first 4 points of the strength bar", function() {
            scope.$apply(function() {
                scope.password = "mo5ch$=!"; // that should trigger the 3 first points
            });

            var firstpointStyle = elm.find('ul').children('li')[0].getAttribute('style');
            dump(firstpointStyle);
            expect(firstpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var secondpointStyle = elm.find('ul').children('li')[1].getAttribute('style');
            expect(secondpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var thirdpointStyle = elm.find('ul').children('li')[2].getAttribute('style');
            expect(thirdpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var fourthpointStyle = elm.find('ul').children('li')[3].getAttribute('style');
            expect(fourthpointStyle).toContain('background-color: rgb(153, 255, 0)');

            var fifthpointStyle = elm.find('ul').children('li')[4].getAttribute('style');
            expect(fifthpointStyle).toContain('background-color: rgb(221, 221, 221)');
        });
    });
});
