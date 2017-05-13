'use strict';

const expect = require('chai').expect,
  JDLApplication = require('../../../lib/core/jdl_application');

describe('JDLApplication', () => {
  describe('::new', () => {
    describe('without specifying special options', () => {
      it('uses default values', () => {
        const jdlApplication = new JDLApplication({});
        expect(jdlApplication.baseName).to.eq('jhipster');
        expect(jdlApplication.path).to.eq('jhipster');
        expect(jdlApplication.packageName).to.eq('io.github.jhipster');
        expect(jdlApplication.packageFolder).to.eq('io/github/jhipster');
        expect(jdlApplication.authenticationType).to.eq('session');
        expect(jdlApplication.hibernateCache).to.eq('no');
        expect(jdlApplication.clusteredHttpSession).to.eq('no');
        expect(jdlApplication.websocket).to.eq(false);
        expect(jdlApplication.databaseType).to.eq('sql');
        expect(jdlApplication.devDatabaseType).to.eq('h2Memory');
        expect(jdlApplication.prodDatabaseType).to.eq('mysql');
        expect(jdlApplication.useCompass).to.eq(false);
        expect(jdlApplication.buildTool).to.eq('maven');
        expect(jdlApplication.searchEngine).to.eq(false);
        expect(jdlApplication.enableTranslation).to.eq(true);
        expect(jdlApplication.applicationType).to.eq('monolith');
        expect(jdlApplication.testFrameworks.size()).to.eq(0);
        expect(jdlApplication.languages.has('en')).to.be.true;
        expect(jdlApplication.serverPort).to.eq(8080);
        expect(jdlApplication.enableSocialSignIn).to.eq(false);
        expect(jdlApplication.useSass).to.eq(false);
        expect(jdlApplication.jhiPrefix).to.eq('jhi');
        expect(jdlApplication.messageBroker).to.eq(false);
        expect(jdlApplication.serviceDiscoveryType).to.eq(false);
        expect(jdlApplication.clientPackageManager).to.eq('yarn');
        expect(jdlApplication.clientFramework).to.eq('angular1');
        expect(jdlApplication.nativeLanguage).to.eq('en');
        expect(jdlApplication.frontEndBuilder).to.be.null;
        expect(jdlApplication.skipUserManagement).to.eq(false);
        expect(jdlApplication.skipClient).to.eq(false);
        expect(jdlApplication.skipServer).to.eq(false);
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the application object', () => {
      const jdlApplication = new JDLApplication({});
      expect(jdlApplication.toString()).to.eq(`application {
  baseName jhipster
  path jhipster
  packageName io.github.jhipster
  packageFolder io/github/jhipster
  authenticationType session
  hibernateCache no
  clusteredHttpSession no
  websocket false
  databaseType sql
  devDatabaseType h2Memory
  prodDatabaseType mysql
  useCompass false
  buildTool maven
  searchEngine false
  enableTranslation true
  applicationType monolith
  testFrameworks
  languages en
  serverPort 8080
  enableSocialSignIn false
  useSass false
  jhiPrefix jhi
  messageBroker false
  serviceDiscoveryType false
  clientPackageManager yarn
  clientFramework angular1
  nativeLanguage en
  frontEndBuilder
  skipUserManagement false
  skipClient false
  skipServer false
}`);
    });
  });
});
