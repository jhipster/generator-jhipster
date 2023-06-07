# Container name and `alias` can be used to retrieve the image with the tag
# Tags can retrieved using the `alias` with `Tag` suffix
# Images can be retrieved using the `alias` with `Image` suffix
FROM jhipster/jhipster-registry:v7.4.0
LABEL ALIAS=jhipster-registry

FROM jhipster/jhipster-control-center:v0.5.0
LABEL ALIAS=jhipster-control-center

FROM jhipster/consul-config-loader:v0.4.1
LABEL ALIAS=consul-config-loader

FROM postgres:15.3
LABEL ALIAS=postgresql

FROM quay.io/keycloak/keycloak:20.0.1
LABEL ALIAS=keycloak

FROM mysql:8.0.33

FROM mariadb:10.11.3

FROM mongo:6.0.6
LABEL ALIAS=mongodb

FROM couchbase/server:7.2.0
LABEL ALIAS=couchbase

FROM cassandra:3.11.14

FROM mcr.microsoft.com/mssql/server:2019-CU16-GDR1-ubuntu-20.04
LABEL ALIAS=mssql

FROM neo4j:5.8.0

FROM hazelcast/management-center:5.3.0
LABEL ALIAS=hazelcast

FROM memcached:1.6.20-alpine

FROM redis:7.0.11

FROM confluentinc/cp-kafka:7.4.0
LABEL ALIAS=kafka

FROM confluentinc/cp-zookeeper:7.4.0
LABEL ALIAS=zookeeper

FROM apachepulsar/pulsar:3.0.0
LABEL ALIAS=pulsar

FROM sonarqube:10.0.0-community
LABEL ALIAS=sonar

FROM docker.io/bitnami/consul:1.15.3
LABEL ALIAS=consul

FROM prom/prometheus:v2.44.0
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.25.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:9.5.3
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
