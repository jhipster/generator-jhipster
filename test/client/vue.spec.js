const expect = require('expect');
const path = require('path');
const { skipPrettierHelpers: helpers } = require('../utils/utils');
const { OAUTH2 } = require('../../jdl/jhipster/authentication-types');
const { VUE } = require('../../jdl/jhipster/client-framework-types');

const commonOptions = { clientFramework: VUE };

describe('JHipster vue generator', () => {
  describe('microfrontend', () => {
    it('should not succeed', async () => {
      await expect(
        helpers
          .create(path.join(__dirname, '../../generators/client'))
          .withOptions({
            skipInstall: true,
            auth: OAUTH2,
            microfrontend: true,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['fr', 'en'],
            ...commonOptions,
          })
          .run()
      ).rejects.toThrow('Microfrontend requires angularX client framework.');
    });
  });
});
