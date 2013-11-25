Hipster stack for Java developers
==========================

Presentation
------------------

This is a [Yeoman generator](http://yeoman.io), used to create a Yeoman + Maven + Spring + AngularJS project.

Our goal is to generate a complete and modern Web app, unifying:

- Maven on the server side
- Yeoman + Bower + Grunt on the client side

You can checkout a sample generated application [here](https://github.com/jdubois/jhipster-sample-app).

Technology stack on the server side
--------------------

A complete [Spring application](http://spring.io/):

- "development" and "production" profiles
- [Spring Security](http://docs.spring.io/spring-security/site/index.html)
- [Spring MVC REST](http://spring.io/guides/gs/rest-service/) + [Jackson](https://github.com/FasterXML/jackson)
- [Spring Data JPA](http://projects.spring.io/spring-data-jpa/) + Bean Validation
- Database updates with [Liquibase](http://www.liquibase.org/)

Ready to go into production :

- Monitoring with [Metrics](http://metrics.codahale.com/)
- Caching with [ehcache](http://ehcache.org/)
- Optimized static resources (gzip filter, HTTP cache headers)
- Log management with [Logback](http://logback.qos.ch/), configurable at runtime
- Builds a standard WAR file

Technology stack on the client side
--------------------

Single Web page application :

- Responsive Web Design
- [HTML5 Boilerplate](http://html5boilerplate.com/)
- [Twitter Bootstrap](http://getbootstrap.com/)
- [Compass](http://compass-style.org/) / Sass for CSS design
- [AngularJS](http://angularjs.org/)

Easy installation of new libraries with [Bower](http://bower.io/).
Build, optimization and live reload with [Grunt](http://gruntjs.com/).

Installation
-------------------

Install Node.js from [the Node.js website](http://nodejs.org/).

Install Yeoman:

```bash
npm install -g yo
```

Install JHipster:

```bash
npm install -g generator-webapp
```

To find more information, tips and help, please have a look at 
[the Yeoman "getting starting" guide](http://yeoman.io/gettingstarted.html) before 
[submitting a bug](https://github.com/jdubois/generator-jhipster/issues?state=open).

Usage
-------------------

To generate your application, type:
```bash
yo jhipster
```

Once the application is generated, you can launch the Java server with Maven:
```bash
mvn jetty:run
```
The application will be available on [http://localhost:8080](http://localhost:8080)

You can also run Grunt to work on the client-side JavaScript application:
```bash
grunt server
```
This should open up your Web browser, with live reload enabled, on [http://localhost:9000](http://localhost:9000). This 
Grunt server has a proxy to the REST endpoints on the Java server which we just launched (on 
[http://localhost:8080/rest](http://localhost:8080/rest)), so it should be able to do live REST requests to the Java
back-end.

**If you want to go further, and use hot reloading both on the client and the server side, please [go to this Wiki page](https://github.com/jdubois/generator-jhipster/wiki/Hot-reloading).**

*Copyright (C) 2013 [Julien Dubois](http://www.julien-dubois.com/)*
