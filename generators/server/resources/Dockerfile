# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.4.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:16.1
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:23.0.1
LABEL ALIAS=keycloak

FROM mysql:8.2.0

FROM mariadb:11.2.2

FROM mongo:7.0.4
LABEL ALIAS=mongodb

FROM couchbase/server:7.2.3
LABEL ALIAS=couchbase

FROM cassandra:4.1.3

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.14.0

FROM hazelcast/management-center:5.3.3
LABEL ALIAS=hazelcast

FROM memcached:1.6.22-alpine

FROM redis:7.2.3

FROM confluentinc/cp-kafka:7.5.2
LABEL ALIAS=kafka

FROM confluentinc/cp-zookeeper:7.5.2
LABEL ALIAS=zookeeper

FROM apachepulsar/pulsar:3.1.1
LABEL ALIAS=pulsar

FROM sonarqube:10.3.0-community
LABEL ALIAS=sonar

FROM docker.io/bitnami/consul:1.17.0
LABEL ALIAS=consul

FROM prom/prometheus:v2.48.0
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.26.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:10.2.2
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:17-jre-focal
LABEL ALIAS=java-jre

FROM swaggerapi/swagger-editor:latest
LABEL ALIAS=swagger-editor

FROM openzipkin/zipkin:3.0
LABEL ALIAS=zipkin
