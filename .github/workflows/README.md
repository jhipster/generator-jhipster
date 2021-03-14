## Integration Tests

Tests required to guarantee (or best match) the application to work correctly.

### Frontend

Custom workflow, that should cover:

Framework: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/client-framework-types.js)

- angular
- react
- vue

Features and technologies that needs to be tested at least once for framework:

- authentication - complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/authentication-types.js)
  - jwt
  - oauth2
  - session
- websocket - complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/websocket-types.js)
  - spring-websocket
- i18n
  - enabled
  - disabled
- theme

#### Notes:

- websocket - CORS may have different behavior.

#### Implementation:

### Backend

Custom workflow, that should cover:

Implementation type:

- imperative
- reactive

Application type: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/application-types.js)

- monolith
- microservice
- gateway

Features and technologies that needs to be tested at least once for implementation type/application type matrix:

- database type: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/database-types.js)
- service discovery: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/service-discovery-types.js)
- build tool: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/build-tool-types.js)
- cache: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/cache-types.js)
- search engine: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/search-engine-types.js)
- test framework: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/test-framework-types.js)
- websocket: complete list can be found at [definitions](https://github.com/jhipster/generator-jhipster/blob/main/jdl/jhipster/websocket-types.js)
- i18n

#### Notes:

#### Implementation:

### Entities

Tested across others workflows.

Features and technologies:

- dto
- filtering
- fields/relationships validations
- custom id.
- pagination.

#### Notes:

#### Implementation:
