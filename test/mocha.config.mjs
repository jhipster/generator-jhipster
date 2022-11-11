const mochaHooks = {
  beforeAll() {
    process.env.FAKE_KEYTOOL = 'true';
    process.env.VERSION_PLACEHOLDERS = 'true';
  },
};
export default mochaHooks;
