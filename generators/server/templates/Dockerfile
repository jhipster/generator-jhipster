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
