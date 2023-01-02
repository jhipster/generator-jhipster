# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.4.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:15.1
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:20.0.1
LABEL ALIAS=keycloak

FROM mysql:8.0.31

FROM mariadb:10.10.2

FROM mongo:6.0.3
LABEL ALIAS=mongodb

FROM couchbase/server:7.1.3
LABEL ALIAS=couchbase

FROM cassandra:4.1.0

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.3.0

FROM hazelcast/management-center:5.2.1
LABEL ALIAS=hazelcast

FROM memcached:1.6.17-alpine

FROM redis:7.0.7

FROM confluentinc/cp-kafka:7.3.1
LABEL ALIAS=kafka

FROM confluentinc/cp-zookeeper:7.3.1
LABEL ALIAS=zookeeper

FROM sonarqube:9.8.0-community
LABEL ALIAS=sonar

FROM consul:1.14.3

FROM prom/prometheus:v2.41.0
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.25.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:9.3.2
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:17-jre-focal
LABEL ALIAS=java-jre

FROM swaggerapi/swagger-editor:latest
LABEL ALIAS=swagger-editor

FROM openzipkin/zipkin:2.24
LABEL ALIAS=zipkin
