# JHipster-RFC-2: JHipster Control Center

- Feature Name: `jhipster_control_center`
- Start Date: 2019-12-12
- Issue: [jhipster/generator-jhipster#10913](https://github.com/jhipster/generator-jhipster/issues/10913)

## Table of content

- [JHipster-RFC-2: JHipster Control Center](#jhipster-rfc-2-jhipster-control-center)
  - [Table of content](#table-of-content)
  - [Summary](#summary)
  - [Motivation](#motivation)
  - [Guide-level explanation](#guide-level-explanation)
    - [Architecture overview](#architecture-overview)
    - [Description of features](#description-of-features)
    - [Usage in development](#usage-in-development)
    - [Usage in production](#usage-in-production)
  - [Reference-level explanation](#reference-level-explanation)
  - [Drawbacks](#drawbacks)
  - [Rationale and alternatives](#rationale-and-alternatives)
  - [Prior art](#prior-art)
  - [Unresolved questions](#unresolved-questions)
  - [Future possibilities](#future-possibilities)

## Summary

[summary]: #summary

As of JHipster 6.5, the JHipster administrator's management and monitoring UI is spread out to various places (JHipster Registry, angular/react/vue pages) which causes code duplication and slows down their evolution. This RFC proposes to move this functionality to an external application that can be used in different development and production scenarios. In the following, this application will be referred to as the **JHipster Control Center**.

## Motivation

[motivation]: #motivation

In recent years the technology landscape has changed significantly for Java and non Java based microservices but JHipster has somehow failed to adapt because we invested too much in maintaining our Eureka based solution: the JHipster registry. Although this solution is great and very productive for developers, it is not a very popular choice nowadays and our support for microservices without Eureka is lacking. Moreover, if we want to support more languages and technologies (.NET, Node.JS, Micronaut, Quarkus) and integrate them in the JHipster platform, non portable technologies such as Spring Cloud and Eureka cannot be made mandatory.

In the meantime, our experience with the JHipster Registry has showed that in a microservice architecture, it is very valuable to have an overview of your running applications instances either in development or production. Currently this overview is provided as part of the application itself (for JHipster monoliths) or the JHipster Registry (for JHipster microservices). The goal of this RFC is to describe a solution that provides this overview in a new external application which can be used to cover all current use cases and more.

## Guide-level explanation

[guide-level-explanation]: #guide-level-explanation

### Architecture overview

The **JHipster Control Center** is a standard web application that connects to one or several JHipster applications through their management API endpoints. Those management endpoints can either be exposed on the standard API port (typically 8080, 8081, ...) or preferably on a dedicated management port (typically 9999) so that they are isolated from the outside world.

```
/---------\                         +---------------+
| Browser |                   :1337 | JHipster      |
\----+----/-------------+-----------> Control Center|
     |                  |           +----+----------+
     |                  |                |
     |:8080             |:8081           |
+----v-----+      +-----v----+           |
| JHipster |      | JHipster |           |
|   App 1  |      |  App 2   |           |
+----------+      +----------+           |
 :9999/management  :9999/management      |
  ^                 ^                    |
  |                 |                    |
  +-----------------+--------------------+
```

### Description of features

Once logged into the **JHipster Control Center**, the user will be able to view his administrator UI which present operational data coming from his JHipster applications. Typical data available from there will include:

- Health and readiness statuses
- List of application instances and their metadata
- Any information retrieved from management endpoints such as the ones provided by the Spring Boot Actuator (metrics, configuration properties, etc.)
- OpenAPI documentation

The goal of the **JHipster Control Center** is to be used in combination with any kind of JHipster application (monoliths, gateways, back-end only microservices, front-end only UIs, etc.). Its aim is to accompany the application developer through all phases of development and production by providing useful management features.

### Usage in development

In every JHipster app, docker-compose files are present in the `src/main/docker` folder to launch associated services such as databases, message brokers and registries using docker. Among them, a **jhipster-control-center.yml** will let the users starts the **JHipster control-center** which will then be available at [http://localhost:1337](http://localhost:1337). By default the docker-compose file will be generated in such a way that the Control Center will be able to connect to the locally running JHipster application out of the box. Another possible way to run the **JHipster Control Center** in development would be to develop a simple CLI that allows to start the **JHipster Control Center** server quickly. Such a CLI tool could be embedded into the JHipster package distributed on NPM.

### Usage in production

Once deployed on a production server, the **JHipster Control Center** can be configured to discover JHipster application instances automatically by plugging into service discovery backends (Eureka, Consul, Kubernetes) or using a static list of application URLs provided in the configuration.

## Reference-level explanation

[reference-level-explanation]: #reference-level-explanation

Implementation details will be left to the discretion of the **JHipster Control Center** developers but the following guidelines will need to be followed:

- A separate **JHipster Control Center** GitHub repository will host the application and allow collaboration.
- The **JHipster Control Center** application will be based on a Java reactive Spring Boot application using Spring Cloud Gateway as embedded proxy technology.
- The application will include Spring Cloud dependencies to allow it to plug into Eureka, Consul and Kubernetes service discovery mechanism.
- The Management UI will be developed using Vue and can reuse some the existing code that currently lives in the "Admin pages" of a JHipster application.
- The application will be packaged as a docker image and a jar file which will be published on Docker Hub and Maven Central.
- After the initial **JHipster Control Center** 1.0 release, it will be expected to keep backward compatibility with JHipster applications generated with JHipster version 7.0 or higher.
- The **JHipster Control Center** will be an optional part of JHipster so that users will not have to use it. However, we think that it will provide sufficient improvements to the development and operational experience to convince users to adopt it.

## Drawbacks

[drawbacks]: #drawbacks

- As JHipster is first and foremost a code generator, it could be argued that it is not the goal of the project to release non code generator products. Two date, several external products have been released as part of the JHipster organization: the JHipster Registry and JHipster Console and their release cadence has been low compared to the main generator.
- Impose the overhead of running another service in development and production

## Rationale and alternatives

[rationale-and-alternatives]: #rationale-and-alternatives

Compared to today's situation, the proposed solution would have the following advantages:

- Reduce the generated code as code related to management screens will no longer be generated
- Faster build times for the front end resulting from less front-end code to compile
- Stop developing the same management UI with 3 different frontend framework (Angular, React and Vue)
- Improve security as management endpoint will no longer be exposed to the outside but only internally on a separate port. Also the **JHipster Control Center** can have proper authentication (JWT, OAuth) rather than the basic authentication scheme that is present on the JHipster registry (which is the only scheme supported by the Eureka server).

## Prior art

[prior-art]: #prior-art

Some existing similar or related solutions :

- [JHipster Registry](https://www.jhipster.tech/jhipster-registry/)
- [Spring Boot Admin](https://codecentric.github.io/spring-boot-admin/current/)
- [Trampoline](https://ernestort.github.io/Trampoline/)
- [Pivotal Cloud Foundry Apps Manager](https://docs.run.pivotal.io/console/manage-apps.html)
- [Azure Spring Cloud](https://azure.microsoft.com/en-in/services/spring-cloud/): currently focused only on running Spring Boot workloads but we can expect management features coming to it in the future.

## Unresolved questions

[unresolved-questions]: #unresolved-questions

- How do we help transition legacy JHipster applications (version lower than 7.0) to be supported by the **JHipster Control Center** ?

## Future possibilities

[future-possibilities]: #future-possibilities

Possible future evolutions:

- Provide a plugin mechanism to let organizations customize the **JHipster Control Center** with custom features without forking
- Seamlessly integrate with observability tools such as ELK, Grafana and Zipkin
- Plug into service mesh telemetry services such as those provided by Istio
- Integrate with the [JHipster Kubernetes Operator](https://github.com/jhipster/jhipster-operator)
