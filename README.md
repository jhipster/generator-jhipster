Hipster stack for Java developers
==========================

Presentation
------------------

**This project is not yet finished!!! We are currently working on an alpha release**

*If you want to help, we will put tasks on [our Github issues page](https://github.com/jdubois/generator-jhipster/issues?labels=enhancement&page=1&state=open)*

This is a [Yeoman generator](http://yeoman.io), used to create a Yeoman + Maven + Spring + AngularJS project.

You can install and use it easily:

- See the [Yeoman community generators page](http://yeoman.io/community-generators.html) or
- Go get [the official package on npmjs.org](https://npmjs.org/package/generator-jhipster) 

Goals
-------------------

Generate a complete and modern Web app, unifying:

- Maven on the server side
- Yeoman + Bower + Grunt on the client side

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
This should open up your Web browser, with live reload enabled, on [http://localhost:9000](http://localhost:9000)


Technology stack on the server side
--------------------

A complete [Spring application](http://spring.io/):

- "development" and "production" profiles
- [Spring Security](http://docs.spring.io/spring-security/site/index.html)
- Spring MVC REST + [Jackson](https://github.com/FasterXML/jackson)
- Spring Data JPA + Bean Validation

Ready to go into production :

- Monitoring with [Yammer Metrics](http://metrics.codahale.com/)
- Caching with [ehcache](http://ehcache.org/)
- Optimized static resources
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

*Copyright (C) 2013 [Julien Dubois](http://www.julien-dubois.com/)*
