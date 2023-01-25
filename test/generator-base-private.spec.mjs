import path from 'path';
import { expect } from 'chai';
import { jestExpect } from 'mocha-expect-snapshot';
import BaseGeneratorClass from '../generators/base/index.mjs';
import { databaseTypes, entityOptions, fieldTypes } from '../jdl/jhipster/index.mjs';

// eslint-disable-next-line import/no-named-default
import { default as JHipsterServerGeneratorClass } from '../generators/server/generator.mjs';
// eslint-disable-next-line import/no-named-default
import { default as DatabaseChangelogLiquibaseClass } from '../generators/liquibase-changelogs/index.mjs';
import { stripMargin } from '../generators/base/support/index.mjs';
import { getDBTypeFromDBValue } from '../generators/server/support/index.mjs';
import { generateEntityClientImports, getTypescriptType, generateTestEntityId } from '../generators/client/support/index.mjs';

// eslint-disable-next-line import/no-named-default
import { default as JHipsterLanguagesGeneratorClass } from '../generators/languages/generator.mjs';
// eslint-disable-next-line import/no-named-default
import { default as JHipsterAngularGeneratorClass } from '../generators/angular/generator.mjs';
// eslint-disable-next-line import/no-named-default
import { default as JHipsterClientGeneratorClass } from '../generators/client/generator.mjs';
import { getEntityParentPathAddition } from '../generators/client/support/index.mjs';

const { CASSANDRA, MONGODB, MYSQL, SQL } = databaseTypes;
const { MapperTypes } = entityOptions;
const { CommonDBTypes } = fieldTypes;

const BaseGenerator = BaseGeneratorClass.prototype;
const ClientGenerator = JHipsterClientGeneratorClass.prototype;
const JHipsterServerGenerator = JHipsterServerGeneratorClass.prototype;
const LanguagesGenerator = JHipsterLanguagesGeneratorClass.prototype;
const AngularGenerator = JHipsterAngularGeneratorClass.prototype;
const JHipsterDatabaseChangelogLiquibase = DatabaseChangelogLiquibaseClass.prototype;

const NO_DTO = MapperTypes.NO;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

describe('generator - base-private', () => {
  describe('stripMargin', () => {
    it('should produce correct output without margin', () => {
      const entityFolderName = 'entityFolderName';
      const entityFileName = 'entityFileName';
      const content = `|export * from './${entityFolderName}/${entityFileName}-update.component';
                 |export * from './${entityFolderName}/${entityFileName}-delete-dialog.component';
                 |export * from './${entityFolderName}/${entityFileName}-detail.component';
                 |export * from './${entityFolderName}/${entityFileName}.component';
                 |export * from './${entityFolderName}/${entityFileName}.state';`;
      const out = `export * from './entityFolderName/entityFileName-update.component';
export * from './entityFolderName/entityFileName-delete-dialog.component';
export * from './entityFolderName/entityFileName-detail.component';
export * from './entityFolderName/entityFileName.component';
export * from './entityFolderName/entityFileName.state';`;
      expect(stripMargin(content)).to.equal(out);
    });
    it('should produce correct indented output without margin', () => {
      const routerName = 'routerName';
      const enableTranslation = true;
      const content = `|<li ui-sref-active="active">
                 |    <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                 |        <span ${enableTranslation ? `data-translate="global.menu.${routerName}"` : ''}>${routerName}</span>
                 |    </a>
                 |</li>`;
      const out = `<li ui-sref-active="active">
    <a ui-sref="routerName" ng-click="vm.collapseNavbar()">
        <span data-translate="global.menu.routerName">routerName</span>
    </a>
</li>`;
      expect(stripMargin(content)).to.equal(out);
    });
  });

  describe('getDBTypeFromDBValue', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        expect(getDBTypeFromDBValue(MYSQL)).to.equal(SQL);
      });
    });
    describe('when called with mongo DB', () => {
      it('return mongodb', () => {
        expect(getDBTypeFromDBValue(MONGODB)).to.equal(MONGODB);
      });
    });
    describe('when called with cassandra', () => {
      it('return cassandra', () => {
        expect(getDBTypeFromDBValue(CASSANDRA)).to.equal(CASSANDRA);
      });
    });
  });

  describe('generateEntityClientImports', () => {
    describe('with relationships from or to the User', () => {
      const relationships = [
        {
          otherEntityAngularName: 'User',
        },
        {
          otherEntityAngularName: 'AnEntity',
        },
      ];
      describe('when called with 2 distinct relationships without dto option', () => {
        it('return a Map with 2 imports', () => {
          const imports = generateEntityClientImports(relationships, NO_DTO);
          expect(imports).to.have.all.keys('IUser', 'IAnEntity');
          expect(imports.size).to.eql(relationships.length);
        });
      });
      describe('when called with 2 identical relationships without dto option', () => {
        const relationships = [
          {
            otherEntityAngularName: 'User',
          },
          {
            otherEntityAngularName: 'User',
          },
        ];
        it('return a Map with 1 import', () => {
          const imports = generateEntityClientImports(relationships, NO_DTO);
          expect(imports).to.have.key('IUser');
          expect(imports.size).to.eql(1);
        });
      });
    });
  });

  describe('generateTestEntityId', () => {
    describe('when called with int', () => {
      it('return 123', () => {
        expect(generateTestEntityId('int')).to.equal(123);
      });
    });
    describe('when called with String', () => {
      it("return 'ABC'", () => {
        expect(generateTestEntityId('String')).to.equal("'ABC'");
      });
    });
    describe('when called with UUID', () => {
      it("return '9fec3727-3421-4967-b213-ba36557ca194'", () => {
        expect(generateTestEntityId('UUID')).to.equal("'9fec3727-3421-4967-b213-ba36557ca194'");
      });
    });
  });

  describe('formatAsApiDescription', () => {
    describe('when formatting a nil text', () => {
      it('returns it', () => {
        expect(JHipsterServerGenerator.formatAsApiDescription()).to.equal(undefined);
      });
    });
    describe('when formatting an empty text', () => {
      it('returns it', () => {
        expect(JHipsterServerGenerator.formatAsApiDescription('')).to.equal('');
      });
    });
    describe('when formatting normal texts', () => {
      describe('when having empty lines', () => {
        it('discards them', () => {
          expect(JHipsterServerGenerator.formatAsApiDescription('First line\n \nSecond line\n\nThird line')).to.equal(
            'First line Second line Third line'
          );
        });
      });
      describe('when having HTML tags', () => {
        it('keeps them', () => {
          expect(JHipsterServerGenerator.formatAsApiDescription('Not boldy\n<b>boldy</b>')).to.equal('Not boldy<b>boldy</b>');
        });
      });
      describe('when having a plain text', () => {
        it('puts a space before each line', () => {
          expect(JHipsterServerGenerator.formatAsApiDescription('JHipster is\na great generator')).to.equal(
            'JHipster is a great generator'
          );
        });
      });
      describe('when having quotes', () => {
        it('formats the text to make the string valid', () => {
          expect(JHipsterServerGenerator.formatAsApiDescription('JHipster is "the" best')).to.equal('JHipster is \\"the\\" best');
        });
      });
    });
  });

  describe('formatAsLiquibaseRemarks', () => {
    describe('when formatting a nil text', () => {
      it('returns it', () => {
        expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks()).to.equal(undefined);
      });
    });
    describe('when formatting an empty text', () => {
      it('returns it', () => {
        expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks('')).to.equal('');
      });
    });
    describe('when formatting normal texts', () => {
      describe('when having empty lines', () => {
        it('discards them', () => {
          expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks('First line\n \nSecond line\n\nThird line')).to.equal(
            'First line Second line Third line'
          );
        });
      });
      describe('when having a plain text', () => {
        it('puts a space before each line', () => {
          expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks('JHipster is\na great generator')).to.equal(
            'JHipster is a great generator'
          );
        });
      });
      describe('when having ampersand', () => {
        it('formats the text to escape it', () => {
          expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks('JHipster uses Spring & Hibernate')).to.equal(
            'JHipster uses Spring &amp; Hibernate'
          );
        });
      });
      describe('when having quotes', () => {
        it('formats the text to escape it', () => {
          expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks('JHipster is "the" best')).to.equal(
            'JHipster is &quot;the&quot; best'
          );
        });
      });
      describe('when having apostrophe', () => {
        it('formats the text to escape it', () => {
          expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks("JHipster is 'the' best")).to.equal(
            'JHipster is &apos;the&apos; best'
          );
        });
      });
      describe('when having HTML tags < and >', () => {
        it('formats the text to escape it', () => {
          expect(JHipsterDatabaseChangelogLiquibase.formatAsLiquibaseRemarks('Not boldy\n<b>boldy</b>')).to.equal(
            'Not boldy&lt;b&gt;boldy&lt;/b&gt;'
          );
        });
      });
    });
  });

  describe('getEntityParentPathAddition', () => {
    describe('when passing /', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '/')).to.equal('');
      });
    });
    describe('when passing /foo/', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '/foo/')).to.equal('../');
      });
    });
    describe('when passing undefined', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env)).to.equal('');
      });
    });
    describe('when passing empty', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '')).to.equal('');
      });
    });
    describe('when passing foo', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, 'foo')).to.equal('../');
      });
    });
    describe('when passing foo/bar', () => {
      it('returns ../../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, 'foo/bar')).to.equal(`..${path.sep}../`);
      });
    });
    describe('when passing ../foo', () => {
      it('returns an empty string', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../foo')).to.equal('');
      });
    });
    describe('when passing ../foo/bar', () => {
      it('returns ../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../foo/bar')).to.equal('../');
      });
    });
    describe('when passing ../foo/bar/foo2', () => {
      it('returns ../../', () => {
        expect(getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../foo/bar/foo2')).to.equal(`..${path.sep}../`);
      });
    });
    describe('when passing ../../foo', () => {
      it('throw an error', () => {
        expect(() => getEntityParentPathAddition(ClientGenerator.logger, ClientGenerator.env, '../../foo')).to.throw();
      });
    });
  });

  describe('getTypescriptType', () => {
    describe('when called with sql DB name', () => {
      it('return SQL', () => {
        jestExpect(Object.fromEntries(Object.values(CommonDBTypes).map(dbType => [dbType, getTypescriptType(dbType)])))
          .toMatchInlineSnapshot(`
{
  "AnyBlob": "string",
  "BigDecimal": "number",
  "Blob": "string",
  "Boolean": "boolean",
  "Double": "number",
  "Duration": "string",
  "Enum": "Enum",
  "Float": "number",
  "ImageBlob": "string",
  "Instant": "dayjs.Dayjs",
  "Integer": "number",
  "LocalDate": "dayjs.Dayjs",
  "Long": "number",
  "String": "string",
  "TextBlob": "string",
  "UUID": "string",
  "ZonedDateTime": "dayjs.Dayjs",
}
`);
      });
    });
  });
});
