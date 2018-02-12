<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
import { browser } from 'protractor';
import { NavBarPage } from './../../<%= entityParentPathAddition %>page-objects/jhi-page-objects';
import { <%= entityClass %>ComponentsPage, <%= entityClass %>DialogPage } from './<%= entityFileName %>.page-object';
<%_ let fieldHasByte = false;
fields.forEach((field) => {
    if (['byte[]', 'ByteBuffer'].includes(field.fieldType) && field.fieldTypeBlobContent !== 'text') {
        fieldHasByte = true;
    }
});
if (fieldHasByte) {
    %>import * as path from 'path';
<% } _%>
<%_
let elementGetter = `getText()`;
let openBlockComment = ``;
let closeBlockComment = ``;
if (enableTranslation) {
    elementGetter = `getAttribute('jhiTranslate')`;
}
for (let relationship of relationships) {
    if (relationship.relationshipRequired) {
        openBlockComment = `/*`;
        closeBlockComment = `*/`;
        break;
    }
} _%>

describe('<%= entityClass %> e2e test', () => {

    let navBarPage: NavBarPage;
    let <%= entityInstance %>DialogPage: <%= entityClass %>DialogPage;
    let <%= entityInstance %>ComponentsPage: <%= entityClass %>ComponentsPage;
    <%_ if (fieldHasByte) { _%>
    const fileToUpload = '../../../../../<%= entityParentPathAddition %>main/webapp/content/images/logo-jhipster.png';
    const absolutePath = path.resolve(__dirname, fileToUpload);
    <%_ } _%>

    beforeAll(() => {
        browser.get('/');
        browser.waitForAngular();
        navBarPage = new NavBarPage();
        <%_ if (authenticationType === 'oauth2') { _%>
        navBarPage.getSignInPage().loginWithOAuth('admin', 'admin');
        <%_ } else { _%>
        navBarPage.getSignInPage().autoSignInUsing('admin', 'admin');
        <%_ } _%>
        browser.waitForAngular();
    });

    it('should load <%= entityClassPlural %>', () => {
        navBarPage.goToEntity('<%= entityStateName %>');
        <%= entityInstance %>ComponentsPage = new <%= entityClass %>ComponentsPage();
        <%_ if (enableTranslation) { _%>
        expect(<%= entityInstance %>ComponentsPage.getTitle())
            .toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.title/);
        <%_ } else { _%>
        expect(<%= entityInstance %>ComponentsPage.getTitle())
            .toMatch(/<%= entityClassPluralHumanized %>/);
        <%_ } _%>

    });

    it('should load create <%= entityClass %> dialog', () => {
        <%= entityInstance %>ComponentsPage.clickOnCreateButton();
        <%= entityInstance %>DialogPage = new <%= entityClass %>DialogPage();
        <%_ if (enableTranslation) { _%>
        expect(<%= entityInstance %>DialogPage.getModalTitle())
            .toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.createOrEditLabel/);
        <%_ } else { _%>
        expect(<%= entityInstance %>DialogPage.getModalTitle())
            .toMatch(/Create or edit a <%= entityClassHumanized %>/);
        <%_ } _%>
        <%= entityInstance %>DialogPage.close();
    });

   <%= openBlockComment %> it('should create and save <%= entityClassPlural %>', () => {
        <%= entityInstance %>ComponentsPage.clickOnCreateButton();
        <%_ fields.forEach((field) => {
            const fieldName = field.fieldName;
            const fieldNameCapitalized = field.fieldNameCapitalized;
            const fieldType = field.fieldType;
            const fieldTypeBlobContent = field.fieldTypeBlobContent;
            const fieldIsEnum = field.fieldIsEnum;
        _%>
        <%_ if (['Integer', 'Long', 'Float', 'Double', 'BigDecimal'].includes(fieldType)) { _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input('5');
        expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input()).toMatch('5');
        <%_ } else if (fieldType === 'LocalDate') { _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input('2000-12-31');
        expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input()).toMatch('2000-12-31');
        <%_ } else if (['Instant', 'ZonedDateTime'].includes(fieldType)) { _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input(12310020012301);
        expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input()).toMatch('2001-12-31T02:30');
        <%_ } else if (fieldType === 'Boolean') { _%>
        <%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input().isSelected().then((selected) => {
            if (selected) {
                <%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input().click();
                expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input().isSelected()).toBeFalsy();
            } else {
                <%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input().click();
                expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input().isSelected()).toBeTruthy();
            }
        });
        <%_ } else if (['byte[]', 'ByteBuffer'].includes(fieldType) && fieldTypeBlobContent === 'text') { _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input('<%= fieldName %>');
        expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input()).toMatch('<%= fieldName %>');
        <%_ } else if (['byte[]', 'ByteBuffer'].includes(fieldType)) { _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input(absolutePath);
        <%_ } else if(fieldIsEnum) { _%>
        <%= entityInstance %>DialogPage.<%=fieldName %>SelectLastOption();
        <%_ } else if(fieldType === 'UUID'){ _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input('64c99148-3908-465d-8c4a-e510e3ade974');
        expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input()).toMatch('64c99148-3908-465d-8c4a-e510e3ade974');
        <%_ } else { _%>
        <%= entityInstance %>DialogPage.set<%= fieldNameCapitalized %>Input('<%= fieldName %>');
        expect(<%= entityInstance %>DialogPage.get<%= fieldNameCapitalized %>Input()).toMatch('<%= fieldName %>');
        <%_ } _%>
        <%_ }); _%>
        <%_ relationships.forEach((relationship) => {
            const relationshipType = relationship.relationshipType;
            const ownerSide = relationship.ownerSide;
            const relationshipName = relationship.relationshipName;
            const relationshipFieldName = relationship.relationshipFieldName; _%>
        <%_ if (relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide === true)) { _%>
        <%= entityInstance %>DialogPage.<%=relationshipName %>SelectLastOption();
        <%_ } else if ((relationshipType === 'many-to-many' && ownerSide === true)) { _%>
        // <%= entityInstance %>DialogPage.<%=relationshipName %>SelectLastOption();
        <%_ } _%>
        <%_ }); _%>
        <%= entityInstance %>DialogPage.save();
        expect(<%= entityInstance %>DialogPage.getSaveButton().isPresent()).toBeFalsy();
    });<%= closeBlockComment %>

    afterAll(() => {
        navBarPage.autoSignOut();
    });
});
