   /* eslint-env mocha */
const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');

describe('Spring Controller Generator', () => {
  it('generates a controller with expected content', async () => {
    await helpers.run(path.join(__dirname, '/generators/spring-controller')).withPrompts({
      packageName: 'com.example.demo',
      controllerName: 'HelloController',
      endpoint: '/api/hello',
      httpMethod: 'GET',
      methodName: 'sayHello',
    });

    const expectedPath = 'src/main/java/com/example/demo/web/rest/HelloController.java';

    assert.file(expectedPath);
    assert.fileContent(expectedPath, 'public class HelloController');
    assert.fileContent(expectedPath, '@GetMapping');
    assert.fileContent(expectedPath, 'public String sayHello()');
  });
});
