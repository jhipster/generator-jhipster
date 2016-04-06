# <%= baseName %>

This application was generated using JHipster, you can find documentation and help at [https://jhipster.github.io](https://jhipster.github.io).

<%_ if (applicationType == 'gateway') { _%>
<%- include('_micro_services_architecture.md'); %>
<%_ } _%>
## Development

Before you can build this project, you must install and configure the following dependencies on your machine:
<% if(!skipClient) { %>
1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools (like
[Bower][] and [BrowserSync][]). You will only need to run this command when dependencies change in package.json.

    npm install

We use [Gulp][] as our build system. Install the Gulp command-line tool globally with:

    npm install -g gulp

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.
<% if (buildTool == 'maven') { %>
    ./mvnw<% } %><% if (buildTool == 'gradle') { %>
    ./gradlew<% } %>
    gulp

Bower is used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in `bower.json`. You can also run `bower update` and `bower install` to manage dependencies.
Add the `-h` flag on any command to see how you can use it. For example, `bower update -h`.
<% } %>

## Building for production

To optimize the <%= baseName %> client for production, run:
<% if (buildTool == 'maven') { %>
    ./mvnw -Pprod clean package<% } %><% if (buildTool == 'gradle') { %>
    ./gradlew -Pprod clean bootRepackage<% } %>
<% if(!skipClient) { %>
This will concatenate and minify CSS and JavaScript files. It will also modify `index.html` so it references
these new files.
<% } %>
To ensure everything worked, run:
<% if (buildTool == 'maven') { %>
    java -jar target/*.war --spring.profiles.active=prod<% } %><% if (buildTool == 'gradle') { %>
    java -jar build/libs/*.war --spring.profiles.active=prod<% } %>
<% if(!skipClient) { %>
Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.

## Testing

Unit tests are run by [Karma][] and written with [Jasmine][]. They're located in `<%= CLIENT_TEST_SRC_DIR %>` and can be run with:

    gulp test

<% if (testFrameworks.indexOf("protractor") > -1) { %>UI end-to-end tests are powered by [Protractor][], which is built on top of WebDriverJS. They're located in `<%= CLIENT_TEST_SRC_DIR %>e2e`
and can be run by starting Spring Boot in one terminal (`<% if (buildTool == 'maven') { %>./mvnw spring-boot:run<% } else { %>./gradlew bootRun<% } %>`) and running the tests (`gulp itest`) in a second one.<% } %>
<% } %>
## Continuous Integration

To setup this project in Jenkins, use the following configuration:

* Project name: `<%= baseName %>`
* Source Code Management
    * Git Repository: `git@github.com:xxxx/<%= baseName %>.git`
    * Branches to build: `*/master`
    * Additional Behaviours: `Wipe out repository & force clone`
* Build Triggers
    * Poll SCM / Schedule: `H/5 * * * *`
* Build<% if (buildTool == 'maven') { %>
    * Invoke Maven / Tasks: `-Pprod clean package`<% } %><% if (buildTool == 'gradle') { %>
    * Invoke Gradle script / Use Gradle Wrapper / Tasks: `-Pprod clean test bootRepackage`<% } %><% if (testFrameworks.indexOf("protractor") > -1) { %>
    * Execute Shell / Command:
        ````
        <% if (buildTool == 'maven') { %>./mvnw spring-boot:run &<% } %><% if (buildTool == 'gradle') { %>./gradlew bootRun &<% } %>
        bootPid=$!
        sleep 30s
        gulp itest
        kill $bootPid
        ````<% } %>
* Post-build Actions
    * Publish JUnit test result report / Test Report XMLs: `build/test-results/*.xml<% if (testFrameworks.indexOf("protractor") > -1) { %>,build/reports/e2e/*.xml<% } %>`

[JHipster]: https://jhipster.github.io/<% if(!skipClient) {%>
[Node.js]: https://nodejs.org/
[Bower]: http://bower.io/
[Gulp]: http://gulpjs.com/
[BrowserSync]: http://www.browsersync.io/
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/2.0/introduction.html
[Protractor]: https://angular.github.io/protractor/<% } %>
