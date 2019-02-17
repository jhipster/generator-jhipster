# Sample application generation

To generate test applications, either automatically by Travis or locally on the developer machine, a number of pre-defined configurations have been prepared.

## Application configurations

Those are described in `.yo-rc.json` files which is the descriptor file created by Yeoman to keep track of the choices selected while generating an application.

-   app-sample-dev: left empty for local testing, launching the generator with the VSCode debugger will generate an app in this folder
-   jdl-default
-   ms-micro-consul
-   ms-micro-eureka
-   ms-ngx-gateway-consul
-   ms-ngx-gateway-eureka
-   ms-ngx-gateway-eureka-oauth2
-   ms-ngx-gateway-uaa
-   ngx-couchbase
-   ngx-default
-   ngx-gradle-fr
-   ngx-h2mem-ws-nol2
-   ngx-mariadb-oauth2-sass-infinispan
-   ngx-mongodb-kafka-cucumber
-   ngx-psql-es-noi18n
-   ngx-session-cassandra-fr
-   react-default
-   react-noi18n-es-ws-gradle-session
-   uaa
-   webflux-mongodb

## Entity configurations

We also have a number of `Entity.json` files for testing different entity configurations.
