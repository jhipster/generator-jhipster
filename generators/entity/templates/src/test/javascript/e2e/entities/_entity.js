'use strict';

describe('<%= entityClass %> e2e test', function () {

    var username = element(by.id('username'));
    var password = element(by.id('password'));
    var entityMenu = element(by.id('entity-menu'));
    var accountMenu = element(by.id('account-menu'));
    var login = element(by.id('login'));
    var logout = element(by.id('logout'));

    beforeAll(function () {
        browser.get('/');

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    it('should load <%= entityClassPlural %>', function () {
        entityMenu.click();
        element.all(by.css('[ui-sref="<%= entityStateName %>"]')).first().click().then(function() {
            <%_ if (enableTranslation) { _%>
            element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.title/);
            });
            <%_ } else { _%>
            expect(element.all(by.css('h2')).first().getText()).toMatch(/<%= entityClassPluralHumanized %>/);
            <%_ } _%>
        });
    });

    it('should load create <%= entityClass %> dialog', function () {
        element(by.css('[ui-sref="<%= entityStateName %>.new"]')).click().then(function() {
            <%_ if (enableTranslation) { _%>
            element(by.css('h4.modal-title')).getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.createOrEditLabel/);
            });
            <%_ } else { _%>
            expect(element(by.css('h4.modal-title')).getText()).toMatch(/Create or edit a <%= entityClassHumanized %>/);
            <%_ } _%>
            element(by.css('button.close')).click();
        });
    });

	it('should create and save <%= entityClass %>', function () {
        element(by.css('[ui-sref="<%= entityStateName %>.new"]')).click().then(function() {
            <%_ if (enableTranslation) { _%>
            element(by.css('h4.modal-title')).getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.createOrEditLabel/);
            });
            <%_ } else { _%>
            expect(element(by.css('h4.modal-title')).getText()).toMatch(/Create or edit a <%= entityClassHumanized %>/);
            <%_ } _%>
            var <%= entityInstance %>Page = new <%= entityClass %>Page();
			<%_ for (idx in fields) {
					var fieldName = fields[idx].fieldName;
					var fieldNameCapitalized = fields[idx].fieldNameCapitalized;
			_%>
            <%= entityInstance %>Page.set<%= fieldNameCapitalized%>('<%= fieldName %> 1');
            expect(<%= entityInstance %>Page.get<%= fieldNameCapitalized%>()).toBe('<%= fieldName %> 1');
			<%_ } _%>
			<%_ for (idx in relationships) {
				    var relationshipFieldName = relationships[idx].relationshipFieldName;
				    var relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized;
			_%>
			<%= entityInstance %>Page.set<%= relationshipNameCapitalized %>('<%= relationshipFieldName %> 1');
            expect(<%= entityInstance %>Page.get<%= relationshipNameCapitalized %>()).toBe('<%= relationshipFieldName %> 1');
			<%_ } _%> 
            <%= entityInstance %>Page.save();
            expect(<%= entityInstance %>Page.getSaveButton().isPresent()).toBe(false);
            
        });
	});

	var  <%= entityClass %>Page = function() {
		<%_ for (idx in fields) {
            var fieldName = fields[idx].fieldName;
            var fieldNameCapitalized = fields[idx].fieldNameCapitalized;
		_%>
		var <%= fieldName%> = element(by.model('vm.<%= entityInstance %>.<%= fieldName %>'));
		<%_ } _%>
		<%_ for (idx in relationships) {
            var relationshipFieldName = relationships[idx].relationshipFieldName;
            var relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized;
		_%>
		var <%= relationshipFieldName %> = element(by.model('vm.<%= entityInstance %>.<%=relationshipFieldName %>'));
		<%_ } _%>
		<%_ for (idx in fields) {
            var fieldName = fields[idx].fieldName;
            var fieldNameCapitalized = fields[idx].fieldNameCapitalized;
		_%>
		var saveButton = element(by.buttonText('Save'));
		var cancleButton = element(by.buttonText('Cancel'));

		this.set<%= fieldNameCapitalized%> = function(text) {
			<%= fieldName%>.sendKeys(text);
		};
		this.get<%= fieldNameCapitalized%> = function() {
			return <%= fieldName%>.getAttribute('value');
		};
		<%_ } _%>
		<%_ for (idx in relationships) {
            var relationshipFieldName = relationships[idx].relationshipFieldName;
            var relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized;
		_%>
		this.set<%= relationshipNameCapitalized %> = function(text) {
			<%= relationshipFieldName %>.sendKeys(text, protractor.Key.ENTER);
		};
		this.get<%= relationshipNameCapitalized %> = function() {
			return <%= relationshipFieldName %>.element(by.css('option:checked')).getText();
		};
		<%_ } _%>
		this.getSaveButton = function() {
			return saveButton;
		};
		this.save = function() {
			saveButton.click();
		};
		this.getCancleButton = function() {
			return cancleButton;
		};
		this.cancle = function() {
			cancleButton.click();
		};
	};

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
