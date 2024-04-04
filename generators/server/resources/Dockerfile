# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.4.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:16.2
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:24.0.2
LABEL ALIAS=keycloak

FROM mysql:8.3.0

FROM mariadb:11.3.2

FROM mongo:7.0.6
LABEL ALIAS=mongodb

FROM couchbase/server:7.6.1
LABEL ALIAS=couchbase

FROM cassandra:5.0

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.18.1

FROM hazelcast/management-center:5.3.3
LABEL ALIAS=hazelcast

FROM memcached:1.6.26-alpine

FROM redis:7.2.4

FROM confluentinc/cp-kafka:7.6.0
LABEL ALIAS=kafka

FROM confluentinc/cp-zookeeper:7.6.0
LABEL ALIAS=zookeeper

FROM apachepulsar/pulsar:3.2.2
LABEL ALIAS=pulsar

FROM sonarqube:10.4.1-community
LABEL ALIAS=sonar

FROM docker.io/bitnami/consul:1.18.1
LABEL ALIAS=consul

FROM prom/prometheus:v2.51.1
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.27.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:10.4.1
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:17-jre-focal
LABEL ALIAS=java-jre

FROM swaggerapi/swagger-editor:latest
LABEL ALIAS=swagger-editor

FROM openzipkin/zipkin:3.1
LABEL ALIAS=zipkin
