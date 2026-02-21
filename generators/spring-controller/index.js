const path = require('path');
const Generator = require('yeoman-generator').default;

module.exports = class extends Generator {
  async prompting() {
    this.log('\n📦 Spring Controller Generator');
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'packageName',
        message: 'Enter the base package name (e.g., com.example.app):',
        default: 'com.example.app',
      },
      {
        type: 'input',
        name: 'controllerName',
        message: 'Enter the name of the controller (e.g., GreetingController):',
        default: 'GreetingController',
      },
      {
        type: 'input',
        name: 'endpoint',
        message: 'Enter the base endpoint (e.g., /api/greeting):',
        default: '/api/greeting',
      },
      {
        type: 'list',
        name: 'httpmethod',
        message: 'Enter the http method (e.g., GreetingController):',
        choices: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
      },
      {
        type: 'input',
        name: 'methodName',
        message: 'Enter the method name (e.g., GreetingController):',
        default: 'greet',
      },
    ]);
  }

  writing() {
    const packagePath = this.answers.packageName.replace(/\./g, '/');
    const destination = path.join('src/main/java/', packagePath, 'web/rest', `${this.answers.controllerName}.java`);

    this.fs.copyTpl(this.templatePath('Controller.java.ejs'), this.destinationPath(destination), {
      packageName: this.answers.packageName,
      controllerName: this.answers.controllerName,
      endpoint: this.answers.endpoint,
      httpMethod: this.answers.httpmethod.charAt(0).toUpperCase() + this.answers.httpmethod.slice(1).toLowerCase(),
      methodName: this.answers.methodName,
    });
  }

  end() {
    this.log(`\n${this.answers.controllerName}.java created at /src/main/java/.../web/rest`);
  }
};
