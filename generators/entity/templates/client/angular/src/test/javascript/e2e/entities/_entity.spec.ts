<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
import { browser, element, by, $ } from 'protractor';
<%_
let elementGetter = `getText()`;
if (enableTranslation) {
    elementGetter = `getAttribute('jhiTranslate')`;
} _%>

describe('<%= entityClass %> e2e test', () => {

    const username = element(by.id('username'));
    const password = element(by.id('password'));
    const entityMenu = element(by.id('entity-menu'));
    const accountMenu = element(by.id('account-menu'));
    const login = element(by.id('login'));
    const logout = element(by.id('logout'));

    beforeAll(() => {
        browser.get('/');

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
        browser.waitForAngular();
    });

    it('should load <%= entityClassPlural %>', () => {
        entityMenu.click();
        element.all(by.css('[routerLink="<%= entityStateName %>"]')).first().click().then(() => {
            <%_ if (enableTranslation) { _%>
            const expectVal = /<%= angularAppName %>.<%= entityTranslationKey %>.home.title/;
            <%_ } else { _%>
            const expectVal = /<%= entityClassPluralHumanized %>/;
            <%_ } _%>
            element.all(by.css('h2 span')).first().<%- elementGetter %>.then((value) => {
                expect(value).toMatch(expectVal);
            });
        });
    });

    it('should load create <%= entityClass %> dialog', () => {
        element(by.css('button.create-<%= entityUrl %>')).click().then(() => {
            <%_ if (enableTranslation) { _%>
            const expectVal = /<%= angularAppName %>.<%= entityTranslationKey %>.home.createOrEditLabel/;
            <%_ } else { _%>
            const expectVal = /Create or edit a <%= entityClassHumanized %>/;
            <%_ } _%>
            element.all(by.css('h4.modal-title')).first().<%- elementGetter %>.then((value) => {
                expect(value).toMatch(expectVal);
            });

            element(by.css('button.close')).click();
        });
    });

    afterAll(() => {
        accountMenu.click();
        logout.click();
    });
});
