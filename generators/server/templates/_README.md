# <%= baseName %>

This application was generated using JHipster <%= jhipsterVersion %>, you can find documentation and help at [https://jhipster.github.io/documentation-archive/v<%= jhipsterVersion %>/](https://jhipster.github.io/documentation-archive/v<%= jhipsterVersion %>).
<%_ if (applicationType == 'gateway' || applicationType == 'microservice' || applicationType == 'uaa' ) { _%>

This is a <%= applicationType %> application intended to be part of a microservice architecture, please refer to the [http://jhipster.github.io/microservices-architecture/]("Doing microservices with JHipster" page of the documentation) for more information.
<% if (applicationType == 'uaa' ) { %>
This is also a JHipster User Account and Authentication (UAA) Server, refer to the [http://jhipster.github.io/using-uaa/](`Using UAA for Microservice Security` page) for details on how to secure JHipster microservices with OAuth2.<% } %>
<%_ } _%>
## Development

<%_ if(skipClient) { _%>
To start your application in the dev profile, simply run:

    <% if (buildTool == 'maven') { %>./mvnw<% } %><% if (buildTool == 'gradle'){ %>./gradlew<% } %>

<%_ } _%>
<%_ if(!skipClient) { _%>
Before you can build this project, you must install and configure the following dependencies on your machine:
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
<%_ } _%>
For further instructions on how to develop with JHipster, have a look at the [http://jhipster.github.io/development/](`Using JHipster in development` page).

## Using Docker to simplify development

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the `src/main/docker` folder to help you start required third party services.
To start a <%= prodDatabaseType%> database in a docker container, run:

    docker-compose -f src/main/docker/<%= prodDatabaseType%>.yml up -d

To stop it and remove the container, run:

    docker-compose -f src/main/docker/<%= prodDatabaseType%>.yml down

You can also fully dockerize your application and all the services it is depending on.
To achieve this, first build a docker image of your app by running:

    <% if (buildTool == 'maven') { %>./mvnw package -Pprod docker:build<% } %><% if (buildTool == 'gradle') { %>./gradlew bootRepackage -Pprod buildDocker<% } %>

Then run:

    docker-compose -f src/main/docker/app.yml up -d

For more information refer to [Docker and Docker-Compose production](http://jhipster.github.io/docker-compose), this page also contains information on the docker-compose subgenerator (`yo jhipster:docker-compose), that is able to generate docker configurations for one or several JHipster applications.

## Building for production

To optimize the <%= baseName %> application for production, run:
<% if (buildTool == 'maven') { %>
    ./mvnw -Pprod clean package<% } %><% if (buildTool == 'gradle') { %>
    ./gradlew -Pprod clean bootRepackage<% } %>
<% if(!skipClient) { %>
This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references
these new files.
<% } %>
To ensure everything worked, run:
<% if (buildTool == 'maven') { %>
    java -jar target/*.war<% } %><% if (buildTool == 'gradle') { %>
    java -jar build/libs/*.war<% } %>
<% if(!skipClient) { %>
Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.

## Testing

Unit tests are run by [Karma][] and written with [Jasmine][]. They're located in `<%= CLIENT_TEST_SRC_DIR %>` and can be run with:

    gulp test

<% if (testFrameworks.indexOf("protractor") > -1) { %>UI end-to-end tests are powered by [Protractor][], which is built on top of WebDriverJS. They're located in `<%= CLIENT_TEST_SRC_DIR %>e2e`
and can be run by starting Spring Boot in one terminal (`<% if (buildTool == 'maven') { %>./mvnw spring-boot:run<% } else { %>./gradlew bootRun<% } %>`) and running the tests (`gulp itest`) in a second one.<% } %>
<% } %><% if (testFrameworks.indexOf("gatling") > -1) { %>
Performance tests are run by [Gatling]() and written in Scala. They're located in `src/test/gatling` and can be run with:

    <% if (buildTool == 'maven') { %>./mvnw gatling:execute<% } else { %>./gradlew gatlingRun<% } %>

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

[JHipster]: https://jhipster.github.io/
[Gatling]: http://gatling.io/<% if(!skipClient) {%>
[Node.js]: https://nodejs.org/
[Bower]: http://bower.io/
[Gulp]: http://gulpjs.com/
[BrowserSync]: http://www.browsersync.io/
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/2.0/introduction.html
[Protractor]: https://angular.github.io/protractor/<% } %>
