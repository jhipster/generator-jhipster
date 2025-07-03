import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('Blog e2e test', () => {
  const blogPageUrl = '/blog/blog';
  const blogPageUrlPattern = new RegExp('/blog/blog(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const blogSample = { name: 'instead freckle', handle: 'gadzooks' };

  let blog;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/services/blog/api/blogs+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/services/blog/api/blogs').as('postEntityRequest');
    cy.intercept('DELETE', '/services/blog/api/blogs/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (blog) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/services/blog/api/blogs/${blog.id}`,
      }).then(() => {
        blog = undefined;
      });
    }
  });

  it('Blogs menu should load Blogs page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('blog/blog');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Blog').should('exist');
    cy.url().should('match', blogPageUrlPattern);
  });

  describe('Blog page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(blogPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Blog page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/blog/blog/new$'));
        cy.getEntityCreateUpdateHeading('Blog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', blogPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/services/blog/api/blogs',
          body: blogSample,
        }).then(({ body }) => {
          blog = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/services/blog/api/blogs+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [blog],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(blogPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Blog page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('blog');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', blogPageUrlPattern);
      });

      it('edit button click should load edit Blog page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Blog');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', blogPageUrlPattern);
      });

      it('edit button click should load edit Blog page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Blog');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', blogPageUrlPattern);
      });

      it('last delete button click should delete instance of Blog', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('blog').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', blogPageUrlPattern);

        blog = undefined;
      });
    });
  });

  describe('new Blog page', () => {
    beforeEach(() => {
      cy.visit(blogPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Blog');
    });

    it('should create an instance of Blog', () => {
      cy.get(`[data-cy="name"]`).type('ugh satirize');
      cy.get(`[data-cy="name"]`).should('have.value', 'ugh satirize');

      cy.get(`[data-cy="handle"]`).type('gripping fake');
      cy.get(`[data-cy="handle"]`).should('have.value', 'gripping fake');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        blog = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', blogPageUrlPattern);
    });
  });
});
