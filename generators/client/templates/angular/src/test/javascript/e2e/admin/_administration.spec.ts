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
import { browser, element, by } from 'protractor';
<%_
let elementGetter = `getText()`;
if (enableTranslation) {
    elementGetter = `getAttribute('jhiTranslate')`;
} _%>

describe('administration', () => {

    const username = element(by.id('username'));
    const password = element(by.id('password'));
    const accountMenu = element(by.id('account-menu'));
    const adminMenu = element(by.id('admin-menu'));
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

    beforeEach(() => {
        adminMenu.click();
    });

    it('should load user management', () => {
        element(by.css('[routerLink="user-management"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /userManagement.home.title/;
        <%_ } else { _%>
        const expect1 = /Users/;
        <%_ } _%>
        element.all(by.css('h2 span')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load metrics', () => {
        element(by.css('[routerLink="<%=jhiPrefix%>-metrics"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /metrics.title/;
        <%_ } else { _%>
        const expect1 = /Application Metrics/;
        <%_ } _%>
        element.all(by.css('h2 span')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load health', () => {
        element(by.css('[routerLink="<%=jhiPrefix%>-health"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /health.title/;
        <%_ } else { _%>
        const expect1 = /Health Checks/;
        <%_ } _%>
        element.all(by.css('h2 span')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load configuration', () => {
        element(by.css('[routerLink="<%=jhiPrefix%>-configuration"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /configuration.title/;
        <%_ } else { _%>
        const expect1 = /Configuration/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

<%_ if (devDatabaseType !== 'cassandra') { _%>
    it('should load audits', () => {
        element(by.css('[routerLink="audits"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /audits.title/;
        <%_ } else { _%>
        const expect1 = /Audits/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

<%_ } _%>
    it('should load logs', () => {
        element(by.css('[routerLink="logs"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /logs.title/;
        <%_ } else { _%>
        const expect1 = /Logs/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    afterAll(() => {
        accountMenu.click();
        logout.click();
    });
});
