function cleanupOldServerFiles(generator, javaDir, testDir, mainResourceDir, testResourceDir) {
  return {
    // eslint-disable-next-line consistent-return
    cleanupCucumberTests() {
      if (!this.cucumberTests) return undefined;
      if (generator.isJhipsterVersionLessThan('7.4.1')) {
        generator.removeFile(`${testResourceDir}cucumber.properties`);
        generator.removeFile(`${testDir}../features/gitkeep`);
        generator.removeFile(`${testDir}../features/user/user.feature`);
      }
    },
    cleanupServer() {
      if (generator.isJhipsterVersionLessThan('7.4.2')) {
        generator.removeFile(`${javaDir}config/apidocs/GatewaySwaggerResourcesProvider.java`);
        generator.removeFile(`${testDir}config/apidocs/GatewaySwaggerResourcesProviderTest.java`);
      }
    },
  };
}

module.exports = {
  cleanupOldServerFiles,
};
