const { expect } = require('chai');
const { parseFromContent } = require('../../../lib/readers/jdl_reader');

describe('Grammar tests', () => {
  context('when parsing an entity', () => {
    context('with a name', () => {
      let parsedEntity;

      before(() => {
        const content = parseFromContent('entity A');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).to.deep.equal({
          annotations: [],
          body: [],
          javadoc: null,
          name: 'A',
          tableName: 'A'
        });
      });
    });
    context('with a name and a table name', () => {
      let parsedEntity;

      before(() => {
        const content = parseFromContent('entity A(a_table)');
        parsedEntity = content.entities[0];
      });

      it('should parse it', () => {
        expect(parsedEntity).to.deep.equal({
          annotations: [],
          body: [],
          javadoc: null,
          name: 'A',
          tableName: 'a_table'
        });
      });
    });
    context('with annotations and comments', () => {
      context('when comments appear before annotations', () => {
        let parsedEntity;

        before(() => {
          const content = parseFromContent(
            `/** A comment */
 @id
 entity A
 `
          );
          parsedEntity = content.entities[0];
        });

        it('should parse it', () => {
          expect(parsedEntity).to.deep.equal({
            annotations: [
              {
                option: 'id',
                type: 'UNARY'
              }
            ],
            body: [],
            javadoc: ' A comment ',
            name: 'A',
            tableName: 'A'
          });
        });
      });
      context('when comments appear after annotations', () => {
        it('should fail', () => {
          expect(() => {
            parseFromContent(
              `@id
 /** A comment */
 entity A
 `
            );
          }).to.throw();
        });
      });
    });
    context('with a field', () => {
      context('having annotations and comments', () => {
        context('when comments appear before annotations', () => {
          let parsedEntity;

          before(() => {
            const content = parseFromContent(
              `entity A {
  /** field comment */
  @something
  name String
}
`
            );
            parsedEntity = content.entities[0];
          });

          it('should parse it', () => {
            expect(parsedEntity).to.deep.equal({
              annotations: [],
              body: [
                {
                  annotations: [
                    {
                      option: 'something',
                      type: 'UNARY'
                    }
                  ],
                  javadoc: ' field comment ',
                  name: 'name',
                  type: 'String',
                  validations: []
                }
              ],
              javadoc: null,
              name: 'A',
              tableName: 'A'
            });
          });
        });
        context('when comments appear after annotations', () => {
          it('should fail', () => {
            expect(() => {
              parseFromContent(`entity A {
  @something
  /** a comment */
  name String
}
`);
            }).to.throw();
          });
        });
      });
    });
  });
});
