/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const JDLApplication = require('../../../lib/core/jdl_application');

describe('JDLApplication', () => {
  describe('::new', () => {
    describe('without specifying special options', () => {
      it('uses default values', () => {
        const jdlApplication = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } });
        const jdlApplicationConfig = jdlApplication.config;
        expect(jdlApplicationConfig.jhipsterVersion).to.eq('4.9.0');
        expect(jdlApplicationConfig.baseName).to.eq('jhipster');
        expect(jdlApplicationConfig.path).to.eq('jhipster');
        expect(jdlApplicationConfig.packageName).to.eq('com.mycompany.myapp');
        expect(jdlApplicationConfig.packageFolder).to.eq('com/mycompany/myapp');
        expect(jdlApplicationConfig.authenticationType).to.eq('session');
        expect(jdlApplicationConfig.hibernateCache).to.eq('no');
        expect(jdlApplicationConfig.clusteredHttpSession).to.eq('no');
        expect(jdlApplicationConfig.websocket).to.eq(false);
        expect(jdlApplicationConfig.databaseType).to.eq('sql');
        expect(jdlApplicationConfig.devDatabaseType).to.eq('h2Memory');
        expect(jdlApplicationConfig.prodDatabaseType).to.eq('mysql');
        expect(jdlApplicationConfig.useCompass).to.eq(false);
        expect(jdlApplicationConfig.buildTool).to.eq('maven');
        expect(jdlApplicationConfig.searchEngine).to.eq(false);
        expect(jdlApplicationConfig.enableTranslation).to.eq(true);
        expect(jdlApplicationConfig.applicationType).to.eq('monolith');
        expect(jdlApplicationConfig.testFrameworks.size()).to.eq(0);
        expect(jdlApplicationConfig.languages.has('en')).to.be.true;
        expect(jdlApplicationConfig.serverPort).to.eq(8080);
        expect(jdlApplicationConfig.enableSocialSignIn).to.eq(false);
        expect(jdlApplicationConfig.useSass).to.eq(false);
        expect(jdlApplicationConfig.jhiPrefix).to.eq('jhi');
        expect(jdlApplicationConfig.messageBroker).to.eq(false);
        expect(jdlApplicationConfig.serviceDiscoveryType).to.eq(false);
        expect(jdlApplicationConfig.clientPackageManager).to.eq('yarn');
        expect(jdlApplicationConfig.clientFramework).to.eq('angular1');
        expect(jdlApplicationConfig.nativeLanguage).to.eq('en');
        expect(jdlApplicationConfig.frontEndBuilder).to.be.null;
        expect(jdlApplicationConfig.skipUserManagement).to.eq(false);
        expect(jdlApplicationConfig.skipClient).to.eq(false);
        expect(jdlApplicationConfig.skipServer).to.eq(false);
      });
    });
  });
  describe('#toString', () => {
    it('stringifies the application object', () => {
      const jdlApplication = new JDLApplication({ config: { jhipsterVersion: '4.9.0' } });
      expect(jdlApplication.toString()).to.eq(`application {
  config {
    baseName jhipster
    path jhipster
    packageName com.mycompany.myapp
    packageFolder com/mycompany/myapp
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
    jhipsterVersion 4.9.0
  }
}`);
    });
  });
});
