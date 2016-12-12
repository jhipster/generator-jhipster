# <%= baseName %>

This application was generated using JHipster <%= jhipsterVersion %>, you can find documentation and help at [<%= DOCUMENTATION_ARCHIVE_URL %>](<%= DOCUMENTATION_ARCHIVE_URL %>).
<%_ if (applicationType == 'gateway' || applicationType == 'microservice' || applicationType == 'uaa') { _%>

This is a "<%= applicationType %>" application intended to be part of a microservice architecture, please refer to the [Doing microservices with JHipster][] page of the documentation for more information.
<% if (applicationType == 'uaa') { %>
This is also a JHipster User Account and Authentication (UAA) Server, refer to [Using UAA for Microservice Security][] for details on how to secure JHipster microservices with OAuth2.<% } %>
<%_ } _%>
<%_ if (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa') { _%>
This application is configured for Service Discovery and Configuration with <% if (serviceDiscoveryType === 'eureka') { %>the JHipster-Registry<% } %><% if (serviceDiscoveryType === 'consul') { %>Consul<% } %>. On launch, it will refuse to start if it is not able to connect to <% if (serviceDiscoveryType === 'eureka') { %>the JHipster-Registry at [http://localhost:8761](http://localhost:8761)<% } %><% if (serviceDiscoveryType === 'consul') { %>Consul at [http://localhost:8500](http://localhost:8500)<% } %>.<% if (serviceDiscoveryType === 'eureka') { %> For more information, read our documentation on [Service Discovery and Configuration with the JHipster-Registry][].<% } %><% if (serviceDiscoveryType === 'consul') { %> For more information, read our documentation on [Service Discovery and Configuration with Consul][].<% } %>
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

    npm install -g gulp-cli

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

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

## Building for production

To optimize the <%= baseName %> application for production, run:
<% if (buildTool == 'maven') { %>
    ./mvnw -Pprod clean package<% } %><% if (buildTool == 'gradle') { %>
    ./gradlew -Pprod clean bootRepackage<% } %>

<%_ if(!skipClient) { _%>
This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
<%_ } _%>
To ensure everything worked, run:
<% if (buildTool == 'maven') { %>
    java -jar target/*.war<% } %><% if (buildTool == 'gradle') { %>
    java -jar build/libs/*.war<% } %>

<% if(!skipClient) { %>Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.
<% } %>
Refer to [Using JHipster in production][] for more details.

## Testing

To launch your application's tests, run:

    <% if (buildTool == 'maven') { %>./mvnw clean test<% } else { %>./gradlew test<% } %>
<% if(!skipClient) { %>
### Client tests

Unit tests are run by [Karma][] and written with [Jasmine][]. They're located in `<%= CLIENT_TEST_SRC_DIR %>` and can be run with:

    gulp test

<% if (testFrameworks.indexOf("protractor") > -1) { %>UI end-to-end tests are powered by [Protractor][], which is built on top of WebDriverJS. They're located in `<%= CLIENT_TEST_SRC_DIR %>e2e`
and can be run by starting Spring Boot in one terminal (`<% if (buildTool == 'maven') { %>./mvnw spring-boot:run<% } else { %>./gradlew bootRun<% } %>`) and running the tests (`gulp itest`) in a second one.<% } %>
<% } %><% if (testFrameworks.indexOf("gatling") > -1) { %>### Other tests

Performance tests are run by [Gatling][] and written in Scala. They're located in `src/test/gatling` and can be run with:

    <% if (buildTool == 'maven') { %>./mvnw gatling:execute<% } else { %>./gradlew gatlingRun<% } %>
<% } %>
For more information, refer to the [Running tests page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the `src/main/docker` folder to launch required third party services.
For example, to start a <%= prodDatabaseType%> database in a docker container, run:

    docker-compose -f src/main/docker/<%= prodDatabaseType%>.yml up -d

To stop it and remove the container, run:

    docker-compose -f src/main/docker/<%= prodDatabaseType%>.yml down

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

    <% if (buildTool == 'maven') { %>./mvnw package -Pprod docker:build<% } %><% if (buildTool == 'gradle') { %>./gradlew bootRepackage -Pprod buildDocker<% } %>

Then run:

    docker-compose -f src/main/docker/app.yml up -d

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`yo jhipster:docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To set up a CI environment, consult the [Setting up Continuous Integration][] page.

[JHipster Homepage and latest documentation]: <%= DOCUMENTATION_URL %>
[JHipster <%= jhipsterVersion %> archive]: <%= DOCUMENTATION_ARCHIVE_URL %>
<% if (applicationType == 'gateway' || applicationType == 'microservice' || applicationType == 'uaa') { %>[Doing microservices with JHipster]: <%= DOCUMENTATION_ARCHIVE_URL %>/microservices-architecture/<% } %>
<%_ if (applicationType == 'uaa') { _%>[Using UAA for Microservice Security]: <%= DOCUMENTATION_ARCHIVE_URL %>/using-uaa/<%_ } _%>
[Using JHipster in development]: <%= DOCUMENTATION_ARCHIVE_URL %>/development/
<%_ if (serviceDiscoveryType == 'eureka') { _%>
[Service Discovery and Configuration with the JHipster-Registry]: <%= DOCUMENTATION_ARCHIVE_URL %>/microservices-architecture/#jhipster-registry
<%_ } _%>
<%_ if (serviceDiscoveryType == 'consul') { _%>
[Service Discovery and Configuration with Consul]: <%= DOCUMENTATION_ARCHIVE_URL %>/microservices-architecture/#consul
<%_ } _%>
[Using Docker and Docker-Compose]: <%= DOCUMENTATION_ARCHIVE_URL %>/docker-compose
[Using JHipster in production]: <%= DOCUMENTATION_ARCHIVE_URL %>/production/
[Running tests page]: <%= DOCUMENTATION_ARCHIVE_URL %>/running-tests/
[Setting up Continuous Integration]: <%= DOCUMENTATION_ARCHIVE_URL %>/setting-up-ci/

<% if (testFrameworks.indexOf("gatling") > -1) { %>[Gatling]: http://gatling.io/<% } %>
<%_ if(!skipClient) {_%>
[Node.js]: https://nodejs.org/
[Bower]: http://bower.io/
[Gulp]: http://gulpjs.com/
[BrowserSync]: http://www.browsersync.io/
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/2.0/introduction.html
[Protractor]: https://angular.github.io/protractor/
<%_ } _%>
