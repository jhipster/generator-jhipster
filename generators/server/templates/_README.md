<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
# <%= baseName %>
<%_
let clientPackageMngrName = 'Npm';
let clientPackageMngrAddGlobal = 'install -g';
let clientPackageMngrAdd = 'install --save --save-exact';
let clientPackageMngrAddDev = 'install --save-dev --save-exact';
if (clientPackageManager === 'yarn') {
    clientPackageMngrName = 'Yarn';
    clientPackageMngrAddGlobal = 'global add';
    clientPackageMngrAdd = 'add --exact';
    clientPackageMngrAddDev = 'add --dev --exact';
}
_%>
This application was generated using JHipster <%= jhipsterVersion %>, you can find documentation and help at [<%= DOCUMENTATION_ARCHIVE_URL %>](<%= DOCUMENTATION_ARCHIVE_URL %>).
<%_ if (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa') { _%>

This is a "<%= applicationType %>" application intended to be part of a microservice architecture, please refer to the [Doing microservices with JHipster][] page of the documentation for more information.
<% if (applicationType === 'uaa') { %>
This is also a JHipster User Account and Authentication (UAA) Server, refer to [Using UAA for Microservice Security][] for details on how to secure JHipster microservices with OAuth2.<% } %>
<%_ } _%>
<%_ if (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa') { _%>
This application is configured for Service Discovery and Configuration with <% if (serviceDiscoveryType === 'eureka') { %>the JHipster-Registry<% } %><% if (serviceDiscoveryType === 'consul') { %>Consul<% } %>. On launch, it will refuse to start if it is not able to connect to <% if (serviceDiscoveryType === 'eureka') { %>the JHipster-Registry at [http://localhost:8761](http://localhost:8761)<% } %><% if (serviceDiscoveryType === 'consul') { %>Consul at [http://localhost:8500](http://localhost:8500)<% } %>.<% if (serviceDiscoveryType === 'eureka') { %> For more information, read our documentation on [Service Discovery and Configuration with the JHipster-Registry][].<% } %><% if (serviceDiscoveryType === 'consul') { %> For more information, read our documentation on [Service Discovery and Configuration with Consul][].<% } %>
<%_ } _%>

## Development

<%_ if(skipClient) { _%>
To start your application in the dev profile, simply run:

    <% if (buildTool === 'maven') { %>./mvnw<% } %><% if (buildTool === 'gradle'){ %>./gradlew<% } %>

<%_ } _%>
<%_ if(!skipClient) { _%>
Before you can build this project, you must install and configure the following dependencies on your machine:

1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.
<%_ if (clientPackageManager === 'yarn') { _%>
2. [Yarn][]: We use Yarn to manage Node dependencies.
   Depending on your system, you can install Yarn either from source or as a pre-packaged bundle.
<%_ } _%>

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    <%= clientPackageManager %> install

<%_ if (clientFramework !== 'angular1') { _%>
We use <%= clientPackageManager %> scripts and [Webpack][] as our build system.

<%_ } else { _%>
We use [Gulp][] as our build system. Install the Gulp command-line tool globally with:

    <%= clientPackageManager %> <%= clientPackageMngrAddGlobal %> gulp-cli
<%_ } _%>

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.
<% if (buildTool === 'maven') { %>
    ./mvnw<% } %><% if (buildTool === 'gradle') { %>
    ./gradlew<% } %>
<%_ if (clientFramework !== 'angular1') { _%>
    <%= clientPackageManager %> start

[<%= clientPackageMngrName %>][] is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [package.json](package.json). You can also run `<%= clientPackageManager %> update` and `<%= clientPackageManager %> install` to manage dependencies.
Add the `help` flag on any command to see how you can use it. For example, `<%= clientPackageManager %> help update`.

The `<%= clientPackageManager %> run` command will list all of the scripts available to run for this project.
<%_ if (authenticationType === 'oauth2') { _%>

## OAuth 2.0 / OpenID Connect

Congratulations! You've selected an excellent way to secure your JHipster application. If you're not sure what OAuth and OpenID Connect (OIDC) are, please see [What the Heck is OAuth?](https://developer.okta.com/blog/2017/06/21/what-the-heck-is-oauth)

To log in to your app, you'll need to have [Keycloak](https://keycloak.org) up and running. The JHipster Team has created a Docker container for you that has the default users and roles. Start Keycloak using the following command.

```
docker-compose -f src/main/docker/keycloak.yml up
```

The security settings in `src/main/resources/application.yml` are configured for this image.

```yaml
security:
    basic:
        enabled: false
    oauth2:
        client:
            accessTokenUri: http://localhost:9080/auth/realms/jhipster/protocol/openid-connect/token
            userAuthorizationUri: http://localhost:9080/auth/realms/jhipster/protocol/openid-connect/auth
            clientId: web_app
            clientSecret: web_app
            clientAuthenticationScheme: form
            scope: openid profile email
        resource:
            userInfoUri: http://localhost:9080/auth/realms/jhipster/protocol/openid-connect/userinfo
            tokenInfoUri: http://localhost:9080/auth/realms/jhipster/protocol/openid-connect/token/introspect
            preferTokenInfo: false
```

### Okta

If you'd like to use Okta instead of Keycloak, you'll need to change a few things. First, you'll need to create a free developer account at <https://developer.okta.com/signup/>. After doing so, you'll get your own Okta domain, that has a name like `https://dev-123456.oktapreview.com`.

Modify `src/main/resources/application.yml` to use your Okta settings.

```yaml
security:
    basic:
        enabled: false
    oauth2:
        client:
            accessTokenUri: https://{yourOktaDomain}.com/oauth2/default/v1/token
            userAuthorizationUri: https://{yourOktaDomain}.com/oauth2/default/v1/authorize
            clientId: {clientId}
            clientSecret: {clientSecret}
            clientAuthenticationScheme: form
            scope: openid profile email
        resource:
            userInfoUri: https://{yourOktaDomain}.com/oauth2/default/v1/userinfo
            tokenInfoUri: https://{yourOktaDomain}.com/oauth2/default/v1/introspect
            preferTokenInfo: false
```

Create an OIDC App in Okta to get a `{clientId}` and `{clientSecret}`. To do this, log in to your Okta Developer account and navigate to **Applications** > **Add Application**. Click **Web** and click the **Next** button. Give the app a name you’ll remember, specify `http://localhost:8080` as a Base URI, and `http://localhost:8080/login` as a Login Redirect URI. Click **Done** and copy the client ID and secret into your `application.yml` file.

> **TIP:** If you want to use the [Ionic Module for JHipster](https://www.npmjs.com/package/generator-jhipster-ionic), you'll need to add `http://localhost:8100` as a **Login redirect URI** as well.

Create a `ROLE_ADMIN` and `ROLE_USER` group and add users into them. Create a user (e.g., "admin@jhipster.org" with password "Java is hip in 2017!"). Modify e2e tests to use this account when running integration tests. You'll need to change credentials in `src/test/javascript/e2e/account/account.spec.ts` and `src/test/javascript/e2e/admin/administration.spec.ts`.

Navigate to **API** > **Authorization Servers**, click the **Authorization Servers** tab and edit the default one. Click the **Claims** tab and **Add Claim**. Name it "groups" or "roles", and include it in the ID Token. Set the value type to "Groups" and set the filter to be a Regex of `.*`.

After making these changes, you should be good to go! If you have any issues, please post them to [Stack Overflow](https://stackoverflow.com/questions/tagged/jhipster). Make sure to tag your question with "jhipster" and "okta".
<%_ } _%>

### Service workers

Service workers are commented by default, to enable them please uncomment the following code.

* The service worker registering script in index.html

```html
<script>
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
        .register('./sw.js')
        .then(function() { console.log('Service Worker Registered'); });
    }
</script>
```

Note: workbox creates the respective service worker and dynamically generate the `sw.js`

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

    <%= clientPackageManager %> <%= clientPackageMngrAdd %> leaflet

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

    <%= clientPackageManager %> <%= clientPackageMngrAddDev %> @types/leaflet

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
<%_ if (clientFramework === 'angularX') { _%>
Edit [src/main/webapp/app/vendor.ts](src/main/webapp/app/vendor.ts) file:
~~~
import 'leaflet/dist/leaflet.js';
~~~

Edit [src/main/webapp/content/css/vendor.css](src/main/webapp/content/css/vendor.css) file:
~~~
@import '~leaflet/dist/leaflet.css';
~~~
<%_ } _%>
Note: there are still few other things remaining to do for Leaflet that we won't detail here.
<%_ } else { _%>
    gulp

[Bower][] is used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in [bower.json](bower.json). You can also run `bower update` and `bower install` to manage dependencies.
Add the `-h` flag on any command to see how you can use it. For example, `bower update -h`.
<%_ } _%>
<%_ } _%>

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

<%_ if (clientFramework === 'angularX' && applicationType !== 'microservice') { _%>
### Using angular-cli

You can also use [Angular CLI][] to generate some custom client code.

For example, the following command:

    ng generate component my-component

will generate few files:

    create src/main/webapp/app/my-component/my-component.component.html
    create src/main/webapp/app/my-component/my-component.component.ts
    update src/main/webapp/app/app.module.ts
<%_ } _%>

<%_ if (enableSwaggerCodegen) { _%>
### Doing API-First development using swagger-codegen

[Swagger-Codegen]() is configured for this application. You can generate API code from the `src/main/resources/swagger/api.yml` definition file by running:
    <%_ if (buildTool === 'maven') { _%>
```bash
./mvnw generate-sources
```
    <%_ } _%>
    <%_ if (buildTool === 'gradle') { _%>
```bash
./gradlew swagger
```
    <%_ } _%>
Then implements the generated interfaces with `@RestController` classes.

To edit the `api.yml` definition file, you can use a tool such as [Swagger-Editor](). Start a local instance of the swagger-editor using docker by running: `docker-compose -f src/main/docker/swagger-editor.yml up -d`. The editor will then be reachable at [http://localhost:7742](http://localhost:7742).

Refer to [Doing API-First development][] for more details.
<%_ } _%>

## Building for production

To optimize the <%= baseName %> application for production, run:
<% if (buildTool === 'maven') { %>
    ./mvnw -Pprod clean package<% } %><% if (buildTool === 'gradle') { %>
    ./gradlew -Pprod clean bootRepackage<% } %>

<%_ if(!skipClient) { _%>
This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
<%_ } _%>
To ensure everything worked, run:
<% if (buildTool === 'maven') { %>
    java -jar target/*.war<% } %><% if (buildTool === 'gradle') { %>
    java -jar build/libs/*.war<% } %>

<% if(!skipClient) { %>Then navigate to [http://localhost:<%= serverPort %>](http://localhost:<%= serverPort %>) in your browser.
<% } %>
Refer to [Using JHipster in production][] for more details.

## Testing

To launch your application's tests, run:

    <% if (buildTool === 'maven') { %>./mvnw clean test<% } else { %>./gradlew test<% } %>
<% if(!skipClient) { %>
### Client tests

Unit tests are run by [Karma][] and written with [Jasmine][]. They're located in [<%= CLIENT_TEST_SRC_DIR %>](<%= CLIENT_TEST_SRC_DIR %>) and can be run with:

<%_ if (clientFramework !== 'angular1') { _%>
    <%= clientPackageManager %> test
<%_ } else { _%>
    gulp test
<%_ } _%>

<% if (protractorTests) { %>UI end-to-end tests are powered by [Protractor][], which is built on top of WebDriverJS. They're located in [<%= CLIENT_TEST_SRC_DIR %>e2e](<%= CLIENT_TEST_SRC_DIR %>e2e)
and can be run by starting Spring Boot in one terminal (`<% if (buildTool === 'maven') { %>./mvnw spring-boot:run<% } else { %>./gradlew bootRun<% } %>`) and running the tests (`<% if (clientFramework !== 'angular1') { %><%= clientPackageManager %> run e2e<% } else { %>gulp itest<% } %>`) in a second one.<% } %>
<% } %><% if (gatlingTests) { %>### Other tests

Performance tests are run by [Gatling][] and written in Scala. They're located in [src/test/gatling](src/test/gatling) and can be run with:

    <% if (buildTool === 'maven') { %>./mvnw gatling:execute<% } else { %>./gradlew gatlingRun<% } %>
<% } %>
For more information, refer to the [Running tests page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.
<% if (databaseType !== 'no') { %>
For example, to start a <%= prodDatabaseType%> database in a docker container, run:

    docker-compose -f src/main/docker/<%= prodDatabaseType%>.yml up -d

To stop it and remove the container, run:

    docker-compose -f src/main/docker/<%= prodDatabaseType%>.yml down
<% } %>
You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

    <% if (buildTool === 'maven') { %>./mvnw verify -Pprod dockerfile:build<% } %><% if (buildTool === 'gradle') { %>./gradlew bootRepackage -Pprod buildDocker<% } %>

Then run:

    docker-compose -f src/main/docker/app.yml up -d

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[JHipster Homepage and latest documentation]: <%= DOCUMENTATION_URL %>
[JHipster <%= jhipsterVersion %> archive]: <%= DOCUMENTATION_ARCHIVE_URL %>
<% if (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa') { %>[Doing microservices with JHipster]: <%= DOCUMENTATION_ARCHIVE_URL %>/microservices-architecture/<% } %>
<%_ if (applicationType === 'uaa') { _%>[Using UAA for Microservice Security]: <%= DOCUMENTATION_ARCHIVE_URL %>/using-uaa/<%_ } _%>
[Using JHipster in development]: <%= DOCUMENTATION_ARCHIVE_URL %>/development/
<%_ if (serviceDiscoveryType === 'eureka') { _%>
[Service Discovery and Configuration with the JHipster-Registry]: <%= DOCUMENTATION_ARCHIVE_URL %>/microservices-architecture/#jhipster-registry
<%_ } _%>
<%_ if (serviceDiscoveryType === 'consul') { _%>
[Service Discovery and Configuration with Consul]: <%= DOCUMENTATION_ARCHIVE_URL %>/microservices-architecture/#consul
<%_ } _%>
[Using Docker and Docker-Compose]: <%= DOCUMENTATION_ARCHIVE_URL %>/docker-compose
[Using JHipster in production]: <%= DOCUMENTATION_ARCHIVE_URL %>/production/
[Running tests page]: <%= DOCUMENTATION_ARCHIVE_URL %>/running-tests/
[Setting up Continuous Integration]: <%= DOCUMENTATION_ARCHIVE_URL %>/setting-up-ci/

<% if (testFrameworks.includes("gatling")) { %>[Gatling]: http://gatling.io/<% } %>
<%_ if(!skipClient) {_%>
[Node.js]: https://nodejs.org/
[Yarn]: https://yarnpkg.org/
<%_ if (clientFramework !== 'angular1') { _%>
[Webpack]: https://webpack.github.io/
[Angular CLI]: https://cli.angular.io/
<%_ } else { _%>
[Bower]: http://bower.io/
[Gulp]: http://gulpjs.com/
<%_ } _%>
[BrowserSync]: http://www.browsersync.io/
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/2.0/introduction.html
[Protractor]: https://angular.github.io/protractor/
[Leaflet]: http://leafletjs.com/
[DefinitelyTyped]: http://definitelytyped.org/
<%_ } _%>
<%_ if (enableSwaggerCodegen) { _%>
[Swagger-Codegen]: https://github.com/swagger-api/swagger-codegen
[Swagger-Editor]: http://editor.swagger.io
[Doing API-First development]: <%= DOCUMENTATION_ARCHIVE_URL %>/doing-api-first-development/
<%_ } _%>
