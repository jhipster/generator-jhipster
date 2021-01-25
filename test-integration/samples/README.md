# Sample application generation

To generate test applications, either automatically by the CI or locally on the developer machine, a number of pre-defined configurations have been prepared.

## Application configurations

Those are described in `.yo-rc.json` files which is the descriptor file created by Yeoman to keep track of the choices selected while generating an application.

- app-sample-dev: left empty for local testing, launching the generator with the VSCode debugger will generate an app in this folder
- jdl-default
- ms-micro-consul
- ms-micro-eureka
- ms-micro-eureka-infinispan
- ms-micro-eureka-jwt
- ms-ngx-gateway-consul
- ms-ngx-gateway-eureka
- ms-ngx-gateway-eureka-jwt
- ms-ngx-gateway-eureka-oauth2
- ms-react-gateway-consul-jwt
- ms-react-gateway-consul-oauth2
- ngx-couchbase
- ngx-couchbase-search
- ngx-neo4j
- ngx-default
- ngx-gradle-fr
- ngx-gradle-mariadb-oauth2-infinispan
- ngx-gradle-mongodb-kafka-cucumber
- ngx-gradle-psql-es-noi18n-mapsid
- ngx-gradle-npm-h2disk-ws-nocache
- ngx-h2mem-ws-nol2
- ngx-mariadb-oauth2-infinispan
- ngx-mariadb-oauth2-sass-infinispan
- ngx-mongodb-kafka-cucumber
- ngx-psql-es-noi18n-mapsid
- ngx-session-cassandra-fr
- react-default
- react-gradle-cassandra-session-redis
- react-gradle-couchbase-caffeine
- react-gradle-h2mem-memcached
- react-gradle-psql-es-noi18n-mapsid
- react-maven-cassandra-session-redis
- react-maven-couchbase-caffeine
- react-maven-h2mem-memcached
- react-maven-psql-es-noi18n-mapsid
- react-noi18n-es-ws-gradle-session
- webflux-mongodb
- webflux-mongodb-oauth2
- webflux-mongodb-session
- webflux-gateway-jwt
- webflux-gateway-oauth2
- webflux-couchbase
- webflux-couchbase-session
- webflux-couchbase-oauth2
- webflux-mysql
- webflux-psql

## Entity configurations

We also have a number of `Entity.json` files for testing different entity configurations.
