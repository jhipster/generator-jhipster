# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM postgres:15.0
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:19.0.3
LABEL ALIAS=keycloak

FROM mysql:8.0.30

FROM mariadb:10.8.3

FROM mongo:4.4.15
LABEL ALIAS=mongodb

FROM couchbase/server:7.0.3
LABEL ALIAS=couchbase

FROM cassandra:3.11.13

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:4.4.9

FROM hazelcast/management-center:5.1.4
LABEL ALIAS=hazelcast

FROM memcached:1.6.16-alpine
