/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const jestExpect = require('expect');
const sinon = require('sinon');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const Environment = require('yeoman-environment');

const Base = require('../generators/generator-base');
const { testInTempDir, revertTempDir } = require('./utils/utils');
const { parseLiquibaseChangelogDate } = require('../utils/liquibase');
const { H2_MEMORY, H2_DISK, MARIADB, MSSQL, MYSQL, ORACLE, POSTGRESQL } = require('../jdl/jhipster/database-types');
const { JWT } = require('../jdl/jhipster/authentication-types');
const { GENERATOR_COMMON } = require('../generators/generator-list');

const BaseGenerator = Base.prototype;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

const fakeGenerator = custom => {
  return {
    debug: sinon.spy(),
    warning: sinon.spy(),
    copy: sinon.spy(),
    processJs: sinon.spy(),
    processHtml: sinon.spy(),
    template: sinon.spy(),
    templatePath: sinon.stub().callsFake((...dest) => path.join(...dest)),
    ...custom,
  };
};

describe('Generator Base', () => {
  describe('getAllSupportedLanguages', () => {
    describe('when called', () => {
      it('returns an array', () => {
        expect(BaseGenerator.getAllSupportedLanguages()).to.not.have.length(0);
      });
    });
  });
  describe('isSupportedLanguage', () => {
    describe('when called with valid language', () => {
      it('returns true', () => {
        expect(BaseGenerator.isSupportedLanguage('en')).to.be.true;
      });
    });
    describe('when called with invalid language', () => {
      it('returns false', () => {
        expect(BaseGenerator.isSupportedLanguage('ab')).to.equal(false);
      });
    });
  });
  describe('getAllSupportedLanguageOptions', () => {
    describe('when called', () => {
      it('returns an array', () => {
        expect(BaseGenerator.getAllSupportedLanguages()).to.not.have.length(0);
      });
    });
  });
  describe('getTableName', () => {
    describe('when called with a value', () => {
      it('returns a table name', () => {
        expect(BaseGenerator.getTableName('tableName')).to.equal('table_name');
      });
    });
  });
  describe('getColumnName', () => {
    describe('when called with a value', () => {
      it('returns a column name', () => {
        expect(BaseGenerator.getColumnName('colName')).to.equal('col_name');
        expect(BaseGenerator.getColumnName('colNName')).to.equal('colnname');
      });
    });
  });
  describe('getJoinTableName', () => {
    describe('when called with a value', () => {
      it('returns a join table name', () => {
        expect(BaseGenerator.getJoinTableName('entityName', 'relationshipName', POSTGRESQL)).to.equal('rel_entity_name__relationship_name');
      });
    });
    describe('when called with a long name', () => {
      it('returns a proper join table name', () => {
        expect(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', ORACLE)).to.equal('rel_entity_name_l__relation_be');
        expect(BaseGenerator.getJoinTableName('entityNameLonger', 'relationshipName', ORACLE)).to.have.length(30);
      });
    });
    describe('when legacyRelationshipTableName is set', () => {
      it('returns a proper join table name', () => {
        function TestClass() {}
        TestClass.prototype = Object.create(Base.prototype);
        TestClass.prototype.jhipsterConfig = { legacyRelationshipTableName: true };
        expect(TestClass.prototype.getJoinTableName('entityNameLonger', 'relationshipName', ORACLE)).to.equal(
          'rel_entity_name_l__relation_be'
        );
        expect(TestClass.prototype.getJoinTableName('entityNameLonger', 'relationshipName', ORACLE)).to.have.length(30);
      });
    });
  });
  describe('getFKConstraintName', () => {
    describe('when called with a value', () => {
      it('returns a constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('entityName', 'relationshipName', POSTGRESQL)).to.equal(
          'fk_entity_name__relationship_name_id'
        );
      });
    });
    describe('when called with a long name and oracle', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', ORACLE)).to.have.length(30);
        expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', ORACLE)).to.equal(
          'fk_entity_name__relation_03_id'
        );
      });
    });
    describe('when called with a long name and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getFKConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'relationshipLongerNameWithPaginationAndDTO',
            POSTGRESQL
          )
        ).to.have.length(63);
        expect(
          BaseGenerator.getFKConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'relationshipLongerNameWithPaginationAndDTO',
            POSTGRESQL
          )
        ).to.equal('fk_entity_longer_name_with_pagi__relationship_longer_name_b6_id');
      });
    });
    describe('when called with a long name that is near limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', POSTGRESQL).length
        ).to.be.lessThan(64);
        expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToMany', POSTGRESQL)).to.equal(
          'fk_test_custom_table_name__user_many_to_many_user_many_to_8c_id'
        );
        expect(
          BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL).length
        ).to.be.lessThan(64);
        expect(BaseGenerator.getFKConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'fk_test_custom_table_name__user_many_to_many_user_many_to_72_id'
        );
      });
    });
    describe('when called with a long name that is equal to limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.have.length(
          63
        );
        expect(BaseGenerator.getFKConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'fk_test_custom_table_names__user_many_to_many_user_many_t_50_id'
        );
      });
    });
    describe('when called with a long name and no snake case', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', ORACLE, true)).to.have.length(30);
        expect(BaseGenerator.getFKConstraintName('entityNameLongerName', 'relationshipLongerName', ORACLE, true)).to.equal(
          'fk_entityNameL__relation_03_id'
        );
      });
    });
  });
  describe('getUXConstraintName', () => {
    describe('when called with a value', () => {
      it('returns a constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', POSTGRESQL)).to.equal('ux_entity_name__column_name');
      });
    });
    describe('when called with a value and no snake case', () => {
      it('returns a constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('entityName', 'columnName', POSTGRESQL, true)).to.equal('ux_entityName__columnName');
      });
    });
    describe('when called with a long name and oracle', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('entityNameLongerName', 'columnLongerName', ORACLE)).to.have.length(30);
        expect(BaseGenerator.getUXConstraintName('entityNameLongerName', 'columnLongerName', ORACLE)).to.equal(
          'ux_entity_name__column_long_29'
        );
      });
    });
    describe('when called with a long name and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', POSTGRESQL)
        ).to.have.length(63);
        expect(
          BaseGenerator.getUXConstraintName('entityLongerNameWithPaginationAndDTO', 'columnLongerNameWithPaginationAndDTO', POSTGRESQL)
        ).to.equal('ux_entity_longer_name_with_pagi__column_longer_name_with_pag_8b');
      });
    });
    describe('when called with a long name that is near limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL).length
        ).to.be.lessThan(64);
        expect(BaseGenerator.getUXConstraintName('testCustomTableName', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'ux_test_custom_table_name__user_many_to_many_user_many_to_ma_72'
        );
      });
    });
    describe('when called with a long name that is equal to limit and postgresql', () => {
      it('returns a proper constraint name', () => {
        expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.have.length(63);
        expect(BaseGenerator.getUXConstraintName('testCustomTableNames', 'userManyToManyUserManyToManies', POSTGRESQL)).to.equal(
          'ux_test_custom_table_names__user_many_to_many_user_many_to_m_50'
        );
      });
    });
    describe('when called with a long name and postgresql and no snake case', () => {
      it('returns a proper constraint name', () => {
        expect(
          BaseGenerator.getUXConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'columnLongerNameWithPaginationAndDTO',
            POSTGRESQL,
            true
          )
        ).to.have.length(63);
        expect(
          BaseGenerator.getUXConstraintName(
            'entityLongerNameWithPaginationAndDTO',
            'columnLongerNameWithPaginationAndDTO',
            POSTGRESQL,
            true
          )
        ).to.equal('ux_entityLongerNameWithPaginati__columnLongerNameWithPaginat_8b');
      });
    });
  });
  describe('printJHipsterLogo', () => {
    describe('when called', () => {
      it('prints the logo', () => {
        expect(BaseGenerator.printJHipsterLogo()).to.equal(undefined);
      });
    });
  });
  describe('checkForNewVersion', () => {
    describe('when called', () => {
      it('prints the new version info', () => {
        expect(BaseGenerator.checkForNewVersion()).to.equal(undefined);
      });
    });
  });
  describe('getFrontendAppName', () => {
    describe('when called with name having App', () => {
      it('returns the frontend app name', () => {
        BaseGenerator.jhipsterConfig = { baseName: 'myAmazingApp' };
        expect(BaseGenerator.getFrontendAppName()).to.equal('myAmazingApp');
      });
    });
    describe('when called with name', () => {
      it('returns the frontend app name with the App suffix added', () => {
        BaseGenerator.jhipsterConfig = { baseName: 'myAwesomeProject' };
        expect(BaseGenerator.getFrontendAppName()).to.equal('myAwesomeProjectApp');
      });
    });
    describe('when called with name starting with a digit', () => {
      it('returns the default frontend app name - App', () => {
        BaseGenerator.jhipsterConfig = { baseName: '1derful' };
        expect(BaseGenerator.getFrontendAppName()).to.equal('App');
      });
    });
  });
  describe('getMainClassName', () => {
    describe('when called with name', () => {
      it('return the app name', () => {
        BaseGenerator.baseName = 'myTest';
        expect(BaseGenerator.getMainClassName()).to.equal('MyTestApp');
      });
    });
    describe('when called with name having App', () => {
      it('return the app name', () => {
        BaseGenerator.baseName = 'myApp';
        expect(BaseGenerator.getMainClassName()).to.equal('MyApp');
      });
    });
    describe('when called with name having invalid java chars', () => {
      it('return the default app name', () => {
        BaseGenerator.baseName = '9myApp';
        expect(BaseGenerator.getMainClassName()).to.equal('Application');
      });
    });
  });
  describe('writeFilesToDisk', () => {
    describe('when called with default angular client options', () => {
      it('should produce correct files', () => {
        const files = require('../generators/client/files-angular').files; // eslint-disable-line global-require
        const generator = {
          enableTranslation: true,
          serviceDiscoveryType: false,
          authenticationType: JWT,
          testFrameworks: [],
        };
        const out = BaseGenerator.writeFilesToDisk(files, generator, true).sort();
        jestExpect(out).toMatchSnapshot();
      });
    });
    describe('when called with default angular client options skipping user-management', () => {
      it('should produce correct files', () => {
        const files = require('../generators/client/files-angular').files; // eslint-disable-line global-require
        const generator = {
          enableTranslation: true,
          serviceDiscoveryType: false,
          authenticationType: JWT,
          skipUserManagement: true,
          testFrameworks: [],
        };
        const out = BaseGenerator.writeFilesToDisk(files, generator, true).sort();
        jestExpect(out).toMatchSnapshot();
      });
    });
    describe('when called without jhipsterTemplatesFolders and without rootTemplatesPath', () => {
      const files = { files: [{ templates: ['foo'] }] };
      const generator = fakeGenerator();
      let out;
      before('should produce correct files', async () => {
        const filenames = await BaseGenerator.writeFilesToDisk(files, generator, false);
        out = filenames.sort();
      });
      it('should return template file names', () => {
        expect(out).to.eql(['foo']);
      });
      it('should call template with file', () => {
        expect(generator.template.calledOnce).to.be.true;
        expect(generator.template.getCall(0).args[0]).to.be.eql('foo.ejs');
      });
    });
    describe('when called with jhipsterTemplatesFolders', () => {
      const fixturesPath = path.join(__dirname, 'fixtures', 'writeFilesToDisk');
      let generator;
      beforeEach(() => {
        generator = fakeGenerator({
          jhipsterTemplatesFolders: [
            path.join(fixturesPath, 'templates', 'specific'),
            path.join(fixturesPath, 'templates', GENERATOR_COMMON)
          ],
        });
      });
      describe('existing file in templates/specific and templates/common folders', () => {
        const templates = ['all'];
        const files = { files: [{ templates }] };
        let out;
        beforeEach('should produce correct files', async () => {
          const filenames = await BaseGenerator.writeFilesToDisk(files, generator, false);
          out = filenames.sort();
        });
        it('should return template file names', () => {
          expect(out).to.eql(templates);
        });
        it('should call template with the file in templates/specific', () => {
          expect(generator.template.calledOnce).to.be.true;
          expect(generator.template.getCall(0).args[0]).to.be.eql(path.join(fixturesPath, 'templates', 'specific', `${templates[0]}.ejs`));
        });
        it('should forward jhipsterTemplatesFolders as options.root', () => {
          expect(generator.template.getCall(0).args[3].root).to.be.eql(generator.jhipsterTemplatesFolders);
        });
      });
      describe('existing file only in templates/common folder', () => {
        const templates = ['common'];
        const files = { files: [{ templates }] };
        let out;
        beforeEach('should produce correct files', async () => {
          const filenames = await BaseGenerator.writeFilesToDisk(files, generator, false);
          out = filenames.sort();
        });
        it('should return template file names', () => {
          expect(out).to.eql(templates);
        });
        it('should call template with the file in templates/common', () => {
          expect(generator.template.calledOnce).to.be.true;
          expect(generator.template.getCall(0).args[0]).to.be.eql(
            path.join(fixturesPath, 'templates', GENERATOR_COMMON, `${templates[0]}.ejs`)
          );
        });
        it('should forward jhipsterTemplatesFolders as options.root', () => {
          expect(generator.template.getCall(0).args[3].root).to.be.eql(generator.jhipsterTemplatesFolders);
        });
      });
    });
    describe('when called with jhipsterTemplatesFolders and rootTemplatesPath', () => {
      const fixturesPath = path.join(__dirname, 'fixtures', 'writeFilesToDisk');
      const rootTemplatesPath = ['specific', 'common'];
      let generator;
      beforeEach(() => {
        generator = fakeGenerator({
          jhipsterTemplatesFolders: [path.join(fixturesPath, 'templates_override'), path.join(fixturesPath, 'templates')],
        });
      });
      describe('existing file in templates_override/specific, templates/specific, templates/common folders', () => {
        const templates = ['all'];
        const files = { files: [{ templates }] };
        let out;
        beforeEach('should produce correct files', async () => {
          const filenames = await BaseGenerator.writeFilesToDisk(files, generator, rootTemplatesPath);
          out = filenames.sort();
        });
        it('should return template file names', () => {
          expect(out).to.eql(templates);
        });
        it('should call template with the file in templates_override/specific', () => {
          expect(generator.template.calledOnce).to.be.true;
          expect(generator.template.getCall(0).args[0]).to.be.eql(
            path.join(fixturesPath, 'templates_override', 'specific', `${templates[0]}.ejs`)
          );
        });
        it('should forward jhipsterTemplatesFolders concatenated with rootTemplatesPath as options.root', () => {
          expect(generator.template.getCall(0).args[3].root).to.be.eql([
            path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[0]),
            path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[1]),
            path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[0]),
            path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[1]),
          ]);
        });
      });
      describe('existing file only templates/specific folder', () => {
        const templates = ['specific'];
        const files = { files: [{ templates }] };
        let out;
        beforeEach('should produce correct files', async () => {
          const filenames = await BaseGenerator.writeFilesToDisk(files, generator, rootTemplatesPath);
          out = filenames.sort();
        });
        it('should return template file names', () => {
          expect(out).to.eql(templates);
        });
        it('should call template with the file in templates/specific', () => {
          expect(generator.template.calledOnce).to.be.true;
          expect(generator.template.getCall(0).args[0]).to.be.eql(path.join(fixturesPath, 'templates', 'specific', `${templates[0]}.ejs`));
        });
        it('should forward jhipsterTemplatesFolders concatenated with rootTemplatesPath as options.root', () => {
          expect(generator.template.getCall(0).args[3].root).to.be.eql([
            path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[0]),
            path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[1]),
            path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[0]),
            path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[1]),
          ]);
        });
      });
      describe('existing file only templates/common folder', () => {
        const templates = ['common'];
        const files = { files: [{ templates }] };
        let out;
        beforeEach('should produce correct files', async () => {
          const filenames = await BaseGenerator.writeFilesToDisk(files, generator, rootTemplatesPath);
          out = filenames.sort();
        });
        it('should return template file names', () => {
          expect(out).to.eql(['common']);
        });
        it('should call template with the file in templates/common', () => {
          expect(generator.template.callCount).to.be.equal(1);
          expect(generator.template.getCall(0).args[0]).to.be.eql(path.join(fixturesPath, 'templates', 'common', `${templates[0]}.ejs`));
        });
        it('should forward jhipsterTemplatesFolders concatenated with rootTemplatesPath as options.root', () => {
          expect(generator.template.getCall(0).args[3].root).to.be.eql([
            path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[0]),
            path.join(generator.jhipsterTemplatesFolders[0], rootTemplatesPath[1]),
            path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[0]),
            path.join(generator.jhipsterTemplatesFolders[1], rootTemplatesPath[1]),
          ]);
        });
      });
    });
  });
  describe('dateFormatForLiquibase', () => {
    let base;
    let oldCwd;
    let options;
    beforeEach(() => {
      oldCwd = testInTempDir(() => {}, true);
      base = new Base({ ...options, env: Environment.createEnv() });
    });
    afterEach(() => {
      revertTempDir(oldCwd);
    });
    describe('when there is no configured lastLiquibaseTimestamp', () => {
      let firstChangelogDate;
      beforeEach(() => {
        assert.noFile('.yo-rc.json');
        firstChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate(firstChangelogDate).getTime());
      });
    });
    describe('when a past lastLiquibaseTimestamp is configured', () => {
      let firstChangelogDate;
      beforeEach(() => {
        const lastLiquibaseTimestamp = new Date(2000, 1, 1);
        base.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp.getTime());
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(lastLiquibaseTimestamp.getTime());
        firstChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should not return a past changelog date', () => {
        expect(firstChangelogDate.startsWith('2000')).to.be.false;
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate(firstChangelogDate).getTime());
      });
    });
    describe('when a future lastLiquibaseTimestamp is configured', () => {
      let firstChangelogDate;
      let secondChangelogDate;
      beforeEach(() => {
        const lastLiquibaseTimestamp = new Date(Date.parse('2030-01-01'));
        base.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp.getTime());
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(lastLiquibaseTimestamp.getTime());
        firstChangelogDate = base.dateFormatForLiquibase();
        secondChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should return a future changelog date', () => {
        expect(firstChangelogDate.startsWith('2030')).to.be.true;
      });
      it('should return a reproducible changelog date', () => {
        expect(firstChangelogDate).to.be.equal('20300101000001');
        expect(secondChangelogDate).to.be.equal('20300101000002');
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate('20300101000002').getTime());
      });
    });
    describe('with withEntities option', () => {
      before(() => {
        options = { withEntities: true };
      });
      after(() => {
        options = undefined;
      });
      describe('with reproducible=false argument', () => {
        let firstChangelogDate;
        let secondChangelogDate;
        beforeEach(() => {
          firstChangelogDate = base.dateFormatForLiquibase(false);
          secondChangelogDate = base.dateFormatForLiquibase(false);
        });
        it('should return a valid changelog date', () => {
          expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
          expect(/^\d{14}$/.test(secondChangelogDate)).to.be.true;
        });
        it('should return a reproducible changelog date incremental to lastLiquibaseTimestamp', () => {
          expect(firstChangelogDate).to.not.be.equal(secondChangelogDate);
        });
        it('should save lastLiquibaseTimestamp', () => {
          expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate(secondChangelogDate).getTime());
        });
      });
      describe('with a past creationTimestamp option', () => {
        let firstChangelogDate;
        let secondChangelogDate;
        before(() => {
          options.creationTimestamp = '2000-01-01';
        });
        beforeEach(() => {
          firstChangelogDate = base.dateFormatForLiquibase();
          secondChangelogDate = base.dateFormatForLiquibase();
        });
        it('should return a valid changelog date', () => {
          expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
        });
        it('should return a past changelog date', () => {
          expect(firstChangelogDate.startsWith('2000')).to.be.true;
        });
        it('should return a reproducible changelog date', () => {
          expect(firstChangelogDate).to.be.equal('20000101000100');
          expect(secondChangelogDate).to.be.equal('20000101000200');
        });
        it('should save lastLiquibaseTimestamp', () => {
          expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseLiquibaseChangelogDate('20000101000200').getTime());
        });
      });
      describe('with a future creationTimestamp option', () => {
        it('should throw', () => {
          options.creationTimestamp = '2030-01-01';
          expect(() => new Base({ ...options, env: Environment.createEnv() })).to.throw(
            /^Creation timestamp should not be in the future: 2030-01-01\.$/
          );
        });
      });
    });
  });
  describe('getJDBCUrl', () => {
    describe('when called for mysql', () => {
      it('return jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
        expect(BaseGenerator.getJDBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
        );
      });
    });
    describe('when called for mysql with skipExtraOptions enabled', () => {
      it('return jdbc:mysql://localhost:3306/test', () => {
        expect(BaseGenerator.getJDBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'jdbc:mysql://localhost:3306/test'
        );
      });
    });
    describe('when called for mariadb', () => {
      it('return jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
        expect(BaseGenerator.getJDBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
        );
      });
    });
    describe('when called for mariadb with skipExtraOptions enabled', () => {
      it('return jdbc:mariadb://localhost:3306/test', () => {
        expect(BaseGenerator.getJDBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'jdbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for postgresql', () => {
      it('return jdbc:postgresql://localhost:5432/test', () => {
        expect(BaseGenerator.getJDBCUrl(POSTGRESQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:postgresql://localhost:5432/test'
        );
      });
    });
    describe('when called for oracle', () => {
      it('return jdbc:oracle:thin:@localhost:1521:test', () => {
        expect(BaseGenerator.getJDBCUrl(ORACLE, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:oracle:thin:@localhost:1521:test'
        );
      });
    });
    describe('when called for mssql', () => {
      it('return jdbc:sqlserver://localhost:1433;database=test', () => {
        expect(BaseGenerator.getJDBCUrl(MSSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'jdbc:sqlserver://localhost:1433;database=test'
        );
      });
    });
    describe('when called for h2Disk', () => {
      it('return jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(BaseGenerator.getJDBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db' })).to.equal(
          'jdbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1'
        );
      });
    });
    describe('when called for h2Disk with skipExtraOptions enabled', () => {
      it('return jdbc:h2:file:./build/h2db/db/test', () => {
        expect(
          BaseGenerator.getJDBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })
        ).to.equal('jdbc:h2:file:./build/h2db/db/test');
      });
    });
    describe('when called for h2Disk with missing `localDirectory` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getJDBCUrl(H2_DISK, { databaseName: 'test' })).to.throw(
          "'localDirectory' option should be provided for h2Disk databaseType"
        );
      });
    });
    describe('when called for h2Memory', () => {
      it('return jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(BaseGenerator.getJDBCUrl(H2_MEMORY, { databaseName: 'test' })).to.equal(
          'jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
        );
      });
    });
    describe('when called for h2Memory with skipExtraOptions enabled', () => {
      it('return jdbc:h2:mem:test', () => {
        expect(BaseGenerator.getJDBCUrl(H2_MEMORY, { databaseName: 'test', skipExtraOptions: true })).to.equal('jdbc:h2:mem:test');
      });
    });
    describe('when called with missing `databaseName` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getJDBCUrl(MYSQL)).to.throw("option 'databaseName' is required");
      });
    });
    describe('when called for an unknown databaseType', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getJDBCUrl('foodb', { databaseName: 'test' })).to.throw('foodb databaseType is not supported');
      });
    });
  });

  describe('getR2DBCUrl', () => {
    describe('when called for mysql', () => {
      it('return r2dbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true', () => {
        expect(BaseGenerator.getR2DBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false&useLegacyDatetimeCode=false&serverTimezone=UTC&createDatabaseIfNotExist=true'
        );
      });
    });
    describe('when called for mysql with skipExtraOptions enabled', () => {
      it('return r2dbc:mysql://localhost:3306/test', () => {
        expect(BaseGenerator.getR2DBCUrl(MYSQL, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'r2dbc:mysql://localhost:3306/test'
        );
      });
    });
    describe('when called for mariadb', () => {
      it('return r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC', () => {
        expect(BaseGenerator.getR2DBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:mariadb://localhost:3306/test?useLegacyDatetimeCode=false&serverTimezone=UTC'
        );
      });
    });
    describe('when called for mariadb with skipExtraOptions enabled', () => {
      it('return r2dbc:mariadb://localhost:3306/test', () => {
        expect(BaseGenerator.getR2DBCUrl(MARIADB, { databaseName: 'test', hostname: 'localhost', skipExtraOptions: true })).to.equal(
          'r2dbc:mariadb://localhost:3306/test'
        );
      });
    });
    describe('when called for postgresql', () => {
      it('return r2dbc:postgresql://localhost:5432/test', () => {
        expect(BaseGenerator.getR2DBCUrl(POSTGRESQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:postgresql://localhost:5432/test'
        );
      });
    });
    describe('when called for oracle', () => {
      it('return r2dbc:oracle:thin:@localhost:1521:test', () => {
        expect(BaseGenerator.getR2DBCUrl(ORACLE, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:oracle:thin:@localhost:1521:test'
        );
      });
    });
    describe('when called for mssql', () => {
      it('return r2dbc:mssql://localhost:1433/test', () => {
        expect(BaseGenerator.getR2DBCUrl(MSSQL, { databaseName: 'test', hostname: 'localhost' })).to.equal(
          'r2dbc:mssql://localhost:1433/test'
        );
      });
    });
    describe('when called for h2Disk', () => {
      it('return r2dbc:h2:file:./build/h2db/db/test;DB_CLOSE_DELAY=-1', () => {
        expect(BaseGenerator.getR2DBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db' })).to.equal(
          'r2dbc:h2:file://./build/h2db/db/test;DB_CLOSE_DELAY=-1'
        );
      });
    });
    describe('when called for h2Disk with skipExtraOptions enabled', () => {
      it('return r2dbc:h2:file:://./build/h2db/db/test', () => {
        expect(
          BaseGenerator.getR2DBCUrl(H2_DISK, { databaseName: 'test', localDirectory: './build/h2db/db', skipExtraOptions: true })
        ).to.equal('r2dbc:h2:file://./build/h2db/db/test');
      });
    });
    describe('when called for h2Disk with missing `localDirectory` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getR2DBCUrl(H2_DISK, { databaseName: 'test' })).to.throw(
          "'localDirectory' option should be provided for h2Disk databaseType"
        );
      });
    });
    describe('when called for h2Memory', () => {
      it('return r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE', () => {
        expect(BaseGenerator.getR2DBCUrl(H2_MEMORY, { databaseName: 'test' })).to.equal(
          'r2dbc:h2:mem:///test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
        );
      });
    });
    describe('when called for h2Memory with skipExtraOptions enabled', () => {
      it('return r2dbc:h2:mem:///test', () => {
        expect(BaseGenerator.getR2DBCUrl(H2_MEMORY, { databaseName: 'test', skipExtraOptions: true })).to.equal('r2dbc:h2:mem:///test');
      });
    });
    describe('when called with missing `databaseName` option', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getR2DBCUrl(MYSQL)).to.throw("option 'databaseName' is required");
      });
    });
    describe('when called for an unknown databaseType', () => {
      it('throw an error', () => {
        expect(() => BaseGenerator.getR2DBCUrl('foodb', { databaseName: 'test' })).to.throw('foodb databaseType is not supported');
      });
    });
  });

  describe('priorities', () => {
    let mockedPriorities;
    const priorities = [
      'initializing',
      'prompting',
      'configuring',
      'composing',
      'loading',
      'preparing',
      'preparingFields',
      'preparingRelationships',
      'default',
      'writing',
      'postWriting',
      'preConflicts',
      'install',
      'end',
    ];
    before(() => {
      mockedPriorities = {};
      priorities.forEach(priority => {
        mockedPriorities[priority] = sinon.fake();
      });
      const mockBlueprintSubGen = class extends Base {
        get initializing() {
          return {
            mocked() {
              mockedPriorities.initializing();
            },
          };
        }

        get prompting() {
          return {
            mocked() {
              mockedPriorities.prompting();
            },
          };
        }

        get configuring() {
          return {
            mocked() {
              mockedPriorities.configuring();
            },
          };
        }

        get composing() {
          return {
            mocked() {
              mockedPriorities.composing();
            },
          };
        }

        get loading() {
          return {
            mocked() {
              mockedPriorities.loading();
            },
          };
        }

        get preparing() {
          return {
            mocked() {
              mockedPriorities.preparing();
            },
          };
        }

        get preparingFields() {
          return {
            mocked() {
              mockedPriorities.preparingFields();
            },
          };
        }

        get preparingRelationships() {
          return {
            mocked() {
              mockedPriorities.preparingRelationships();
            },
          };
        }

        get default() {
          return {
            mocked() {
              mockedPriorities.default();
            },
          };
        }

        get writing() {
          return {
            mocked() {
              mockedPriorities.writing();
            },
          };
        }

        get postWriting() {
          return {
            mocked() {
              mockedPriorities.postWriting();
            },
          };
        }

        get preConflicts() {
          return {
            mocked() {
              mockedPriorities.preConflicts();
            },
          };
        }

        get install() {
          return {
            mocked() {
              mockedPriorities.install();
            },
          };
        }

        get end() {
          return {
            mocked() {
              mockedPriorities.end();
            },
          };
        }
      };
      return helpers.create(mockBlueprintSubGen).run();
    });

    priorities.forEach((priority, idx) => {
      it(`should execute ${priority}`, () => {
        assert(mockedPriorities[priority].calledOnce);
      });
      if (idx > 0) {
        const lastPriority = priorities[idx - 1];
        it(`should execute ${priority} after ${lastPriority} `, () => {
          assert(mockedPriorities[priority].calledAfter(mockedPriorities[lastPriority]));
        });
      }
    });
  });
});
