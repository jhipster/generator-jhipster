const { expect } = require('expect');
const path = require('path');
const { skipPrettierHelpers: helpers } = require('../utils/utils');
const { OAUTH2 } = require('../../jdl/jhipster/authentication-types');
const { MICROSERVICE } = require('../../jdl/jhipster/application-types');
const { ANGULAR } = require('../../jdl/jhipster/client-framework-types');

const commonOptions = { clientFramework: ANGULAR };

describe('JHipster angular generator', () => {
  describe('microfrontend', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(path.join(__dirname, '../../generators/client'))
        .withOptions({
          skipInstall: true,
          auth: OAUTH2,
          applicationType: MICROSERVICE,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr', 'en'],
          ...commonOptions,
        })
        .run();
    });
    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });
});
