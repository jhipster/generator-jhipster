/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import Environment from 'yeoman-environment';
import { TestAdapter } from 'yeoman-test';
import { basicHelpers as helpers, result as runResult } from '../../test/support/index.mjs';

import Base from './index.mjs';
import { parseChangelog } from './support/timestamp.mjs';
import { createJHipsterLogger } from './support/logger.mjs';

const BaseGenerator: any = Base.prototype;

BaseGenerator.log = msg => {
  // eslint-disable-next-line no-console
  console.log(msg);
};

BaseGenerator.logger = createJHipsterLogger();

describe('generator - base', () => {
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
  describe('dateFormatForLiquibase', () => {
    let base;
    let options;
    beforeEach(async () => {
      await helpers.prepareTemporaryDir();
      const Dummy = helpers.createDummyGenerator(Base);
      base = new Dummy({ ...options, sharedData: {}, env: Environment.createEnv() });
    });
    describe('when there is no configured lastLiquibaseTimestamp', () => {
      let firstChangelogDate;
      beforeEach(() => {
        runResult.assertNoFile('.yo-rc.json');
        firstChangelogDate = base.dateFormatForLiquibase();
      });
      it('should return a valid changelog date', () => {
        expect(/^\d{14}$/.test(firstChangelogDate)).to.be.true;
      });
      it('should save lastLiquibaseTimestamp', () => {
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog(firstChangelogDate).getTime());
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
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog(firstChangelogDate).getTime());
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
        expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog('20300101000002').getTime());
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
          expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog(secondChangelogDate).getTime());
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
          expect(base.config.get('lastLiquibaseTimestamp')).to.be.equal(parseChangelog('20000101000200').getTime());
        });
      });
      describe('with a future creationTimestamp option', () => {
        it('should throw', () => {
          options.creationTimestamp = '2030-01-01';
          const Dummy = helpers.createDummyGenerator(Base);
          expect(() => new Dummy({ ...options, env: Environment.createEnv(), sharedData: {} })).to.throw(
            /^Creation timestamp should not be in the future: 2030-01-01\.$/
          );
        });
      });
    });
  });
});
