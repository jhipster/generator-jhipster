<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
import { NavBarPage } from './../page-objects/jhi-page-objects';
<%_
let elementGetter = `getText()`;
if (enableTranslation) {
    elementGetter = `getAttribute('jhiTranslate')`;
} _%>

describe('administration', () => {

    let navBarPage: NavBarPage;

    beforeAll(() => {
        browser.get('/');
        browser.waitForAngular();
        navBarPage = new NavBarPage(true);
        <%_ if (authenticationType !== 'oauth2') { _%>
        navBarPage.getSignInPage().autoSignInUsing('admin', 'admin');
        <%_ } else { _%>
        navBarPage.getSignInPage().loginWithOAuth('admin', 'admin');
        <%_ } _%>
        browser.waitForAngular();
    });

    beforeEach(() => {
        navBarPage.clickOnAdminMenu();
    });
    <%_ if (authenticationType !== 'oauth2') { _%>
    it('should load user management', () => {
        navBarPage.clickOnAdmin("user-management");
        <%_ if (enableTranslation) { _%>
        const expect1 = /userManagement.home.title/;
        <%_ } else { _%>
        const expect1 = /Users/;
        <%_ } _%>
        element.all(by.css('h2 span')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });
    <%_ } _%>

    it('should load metrics', () => {
        navBarPage.clickOnAdmin("<%=jhiPrefix%>-metrics");
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
        navBarPage.clickOnAdmin("<%=jhiPrefix%>-health");
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
        navBarPage.clickOnAdmin("<%=jhiPrefix%>-configuration");
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
        navBarPage.clickOnAdmin("audits");
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
        navBarPage.clickOnAdmin("logs");
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
        navBarPage.autoSignOut();
    });
});
