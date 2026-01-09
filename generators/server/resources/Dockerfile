# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.5.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:18.1
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:26.5.0
LABEL ALIAS=keycloak

FROM mysql:9.5.0

FROM mariadb:12.1.2

FROM mongo:8.2.3
LABEL ALIAS=mongodb

FROM couchbase/server:8.0.0
LABEL ALIAS=couchbase

FROM cassandra:5.0.6

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.26.19

FROM hazelcast/management-center:5.9.0
LABEL ALIAS=hazelcast

FROM memcached:1.6.40-alpine

FROM redis:8.4.0

FROM apache/kafka-native:4.1.1
LABEL ALIAS=kafka

FROM apachepulsar/pulsar:4.1.2
LABEL ALIAS=pulsar

FROM sonarqube:26.1.0.118079-community
LABEL ALIAS=sonar

FROM hashicorp/consul:1.22.2
LABEL ALIAS=consul

FROM prom/prometheus:v3.9.1
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.30.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:12.3.1
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:25-jre-noble
LABEL ALIAS=java-jre

FROM swaggerapi/swagger-editor:latest
LABEL ALIAS=swagger-editor

FROM openzipkin/zipkin:3.5.1
LABEL ALIAS=zipkin
