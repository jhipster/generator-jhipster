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
import { element, by } from 'protractor';

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
export class <%= entityClass %>ComponentsPage {
    createButton = element(by.css('.jh-create-entity'));
    title = element.all(by.css('<%= jhiPrefixDashed %>-<%= entityFileName %> div h2 span')).first();

    clickOnCreateButton() {
        return this.createButton.click();
    }

    getTitle() {
        return this.title.<%- elementGetter %>;
    }
}

export class <%= entityClass %>DialogPage {
    modalTitle = element(by.css('h4#my<%= entityClass %>Label'));
    saveButton = element(by.css('.modal-footer .btn.btn-primary'));
    closeButton = element(by.css('button.close'));
    <%_ fields.forEach((field) => {
            const fieldName = field.fieldName;
            const fieldType = field.fieldType;
            const fieldIsEnum = field.fieldIsEnum;
            const fieldTypeBlobContent = field.fieldTypeBlobContent;
    _%>
    <%_ if (fieldIsEnum) { _%>
    <%= fieldName %>Select = element(by.css('select#field_<%= fieldName %>'));
    <%_ } else if (['byte[]', 'ByteBuffer'].includes(fieldType) && fieldTypeBlobContent === 'text') { _%>
    <%= fieldName %>Input = element(by.css('textarea#field_<%= fieldName %>'));
    <%_ } else if (['byte[]', 'ByteBuffer'].includes(fieldType)) { _%>
    <%= fieldName %>Input = element(by.css('input#file_<%= fieldName %>'));
    <%_ } else { _%>
    <%= fieldName %>Input = element(by.css('input#field_<%= fieldName %>'));
    <%_ } _%>
    <%_ }); _%>
    <%_ relationships.forEach((relationship) => {
        const relationshipType = relationship.relationshipType;
        const ownerSide = relationship.ownerSide;
        const relationshipName = relationship.relationshipName;
        const relationshipFieldName = relationship.relationshipFieldName; _%>
    <%_ if (relationshipType === 'many-to-one' || (relationshipType === 'many-to-many' && ownerSide === true) || (relationshipType === 'one-to-one' && ownerSide === true)) { _%>
    <%=relationshipName %>Select = element(by.css('select#field_<%= relationshipName %>'));
    <%_ } _%>
    <%_ }); _%>

    getModalTitle() {
        return this.modalTitle.<%- elementGetter %>;
    }

    <%_ fields.forEach((field) => {
            const fieldName = field.fieldName;
            const fieldNameCapitalized = field.fieldNameCapitalized;
            const fieldNameHumanized = field.fieldNameHumanized;
            const fieldType = field.fieldType;
            const fieldTypeBlobContent = field.fieldTypeBlobContent;
            const fieldIsEnum = field.fieldIsEnum;
            let fieldInputType = 'text';
            let ngModelOption = '';
    _%>
            <%_ if (fieldType === 'Boolean') { _%>
    get<%= fieldNameCapitalized %>Input() {
        return this.<%= fieldName %>Input;
    }
            <%_ } else if (fieldIsEnum) { _%>
    set<%= fieldNameCapitalized %>Select(<%= fieldName %>) {
        this.<%= fieldName %>Select.sendKeys(<%= fieldName %>);
    }

    get<%= fieldNameCapitalized %>Select() {
        return this.<%= fieldName %>Select.element(by.css('option:checked')).getText();
    }

    <%=fieldName %>SelectLastOption() {
        this.<%=fieldName %>Select.all(by.tagName('option')).last().click();
    }
    <%_ } else if (['byte[]', 'ByteBuffer'].includes(fieldType) && fieldTypeBlobContent === 'text') { _%>
    set<%= fieldNameCapitalized %>Input(<%= fieldName %>) {
        this.<%= fieldName %>Input.sendKeys(<%= fieldName %>);
    }

    get<%= fieldNameCapitalized %>Input() {
        return this.<%= fieldName %>Input.getAttribute('value');
    }

    <%_ } else { _%>
    set<%= fieldNameCapitalized %>Input(<%= fieldName %>) {
        this.<%= fieldName %>Input.sendKeys(<%= fieldName %>);
    }

    get<%= fieldNameCapitalized %>Input() {
        return this.<%= fieldName %>Input.getAttribute('value');
    }

    <%_ } _%>
    <%_ }); _%>
    <%_ relationships.forEach((relationship) => {
        const relationshipType = relationship.relationshipType;
        const ownerSide = relationship.ownerSide;
        const relationshipName = relationship.relationshipName;
        const relationshipFieldName = relationship.relationshipFieldName;
        const relationshipNameCapitalized = relationship.relationshipNameCapitalized; _%>
    <%_ if (relationshipType === 'many-to-one' || (relationshipType === 'many-to-many' && ownerSide === true) || (relationshipType === 'one-to-one' && ownerSide === true)) { _%>
    <%=relationshipName %>SelectLastOption() {
        this.<%=relationshipName %>Select.all(by.tagName('option')).last().click();
    }

    <%=relationshipName %>SelectOption(option) {
        this.<%=relationshipName %>Select.sendKeys(option);
    }

    get<%=relationshipNameCapitalized %>Select() {
        return this.<%=relationshipName %>Select;
    }

    get<%=relationshipNameCapitalized %>SelectedOption() {
        return this.<%=relationshipName %>Select.element(by.css('option:checked')).getText();
    }

    <%_ } _%>
    <%_ }); _%>
    save() {
        this.saveButton.click();
    }

    close() {
        this.closeButton.click();
    }

    getSaveButton() {
        return this.saveButton;
    }
}
