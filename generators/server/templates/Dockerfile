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

FROM redis:6.2.7

FROM confluentinc/cp-kafka:7.2.1
LABEL ALIAS=kafka

FROM confluentinc/cp-zookeeper:7.2.1
LABEL ALIAS=zookeeper

FROM sonarqube:9.6.1-community
LABEL ALIAS=sonar

FROM consul:1.13.1

FROM prom/prometheus:v2.38.0
LABEL ALIAS=prometheus

FROM prom/alertmanager:v0.24.0
LABEL ALIAS=prometheus-alertmanager

FROM quay.io/coreos/prometheus-operator:v0.42.1
LABEL ALIAS=prometheus-operator

FROM grafana/grafana:9.1.0
LABEL ALIAS=grafana

FROM quay.io/coreos/grafana-watcher:v0.0.8
LABEL ALIAS=grafana-watcher

FROM jenkins/jenkins:lts-jdk11
LABEL ALIAS=jenkins

FROM eclipse-temurin:11-jre-focal
LABEL ALIAS=java-jre
