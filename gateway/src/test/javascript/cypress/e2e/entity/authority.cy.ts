import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('Authority e2e test', () => {
  const authorityPageUrl = '/authority';
  const authorityPageUrlPattern = new RegExp('/authority(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'admin';
  const password = Cypress.env('E2E_PASSWORD') ?? 'admin';
  const authoritySample = { name: '6732f703-3769-44b9-ad68-27bd3ff0abb9' };

  let authority;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/authorities+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/authorities').as('postEntityRequest');
    cy.intercept('DELETE', '/api/authorities/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (authority) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/authorities/${authority.name}`,
      }).then(() => {
        authority = undefined;
      });
    }
  });

  it('Authorities menu should load Authorities page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('authority');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Authority').should('exist');
    cy.url().should('match', authorityPageUrlPattern);
  });

  describe('Authority page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(authorityPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Authority page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/authority/new$'));
        cy.getEntityCreateUpdateHeading('Authority');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', authorityPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/authorities',
          body: authoritySample,
        }).then(({ body }) => {
          authority = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/authorities+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [authority],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(authorityPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Authority page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('authority');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', authorityPageUrlPattern);
      });

      it('last delete button click should delete instance of Authority', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('authority').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', authorityPageUrlPattern);

        authority = undefined;
      });
    });
  });

  describe('new Authority page', () => {
    beforeEach(() => {
      cy.visit(authorityPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Authority');
    });

    it('should create an instance of Authority', () => {
      cy.get(`[data-cy="name"]`).type('ad959eeb-ca55-404d-a4d7-bd6319c82005');
      cy.get(`[data-cy="name"]`).should('have.value', 'ad959eeb-ca55-404d-a4d7-bd6319c82005');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        authority = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', authorityPageUrlPattern);
    });
  });
});
