# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.5.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:18.0
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:26.4.2
LABEL ALIAS=keycloak

FROM mysql:9.5.0

FROM mariadb:12.0.2

FROM mongo:8.2.1
LABEL ALIAS=mongodb

FROM couchbase/server:8.0.0
LABEL ALIAS=couchbase

FROM cassandra:5.0.5

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.26.15

FROM hazelcast/management-center:5.9.0
LABEL ALIAS=hazelcast

FROM memcached:1.6.39-alpine

FROM redis:8.2.2

FROM apache/kafka-native:4.0.0
LABEL ALIAS=kafka

FROM apachepulsar/pulsar:4.1.1
LABEL ALIAS=pulsar

FROM sonarqube:25.10.0.114319-community
LABEL ALIAS=sonar

FROM hashicorp/consul:1.22.0
LABEL ALIAS=consul

FROM prom/prometheus:v3.7.2
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.28.1
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:12.2.1
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:17-jre-focal
LABEL ALIAS=java-jre

FROM swaggerapi/swagger-editor:latest
LABEL ALIAS=swagger-editor

FROM openzipkin/zipkin:3.5.1
LABEL ALIAS=zipkin
