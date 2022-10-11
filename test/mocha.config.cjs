exports.mochaHooks = {
  beforeAll() {
    process.env.FAKE_KEYTOOL = 'true';
  },
};
