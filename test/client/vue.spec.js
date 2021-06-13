const expect = require('expect');
const path = require('path');
const { skipPrettierHelpers: helpers } = require('../utils/utils');

const {
  SUPPORTED_CLIENT_FRAMEWORKS: { VUE },
} = require('../../generators/generator-constants');

const commonOptions = { clientFramework: VUE };

describe('JHipster vue generator', () => {
  describe('microfrontend', () => {
    it('should not succeed', async () => {
      await expect(
        helpers
          .create(path.join(__dirname, '../../generators/client'))
          .withOptions({
            skipInstall: true,
            auth: 'oauth2',
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
