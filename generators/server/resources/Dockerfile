# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.4.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:16.4
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:25.0.1
LABEL ALIAS=keycloak

FROM mysql:9.0.1

FROM mariadb:11.5.2

FROM mongo:8.0.0
LABEL ALIAS=mongodb

FROM couchbase/server:7.6.3
LABEL ALIAS=couchbase

FROM cassandra:5.0

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.23.0

FROM hazelcast/management-center:5.5.2
LABEL ALIAS=hazelcast

FROM memcached:1.6.31-alpine

FROM redis:7.4.0

FROM confluentinc/cp-kafka:7.7.1
LABEL ALIAS=kafka

FROM confluentinc/cp-zookeeper:7.7.1
LABEL ALIAS=zookeeper

FROM apachepulsar/pulsar:3.3.1
LABEL ALIAS=pulsar

FROM sonarqube:10.6.0-community
LABEL ALIAS=sonar

FROM docker.io/bitnami/consul:1.19.2
LABEL ALIAS=consul

FROM prom/prometheus:v2.54.1
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.27.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:11.2.0
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:17-jre-focal
LABEL ALIAS=java-jre

FROM swaggerapi/swagger-editor:latest
LABEL ALIAS=swagger-editor

FROM openzipkin/zipkin:3.4
LABEL ALIAS=zipkin
