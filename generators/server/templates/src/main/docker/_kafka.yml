version: '2'
services:
    zookeeper:
        image: <%= DOCKER_ZOOKEEPER %>
        ports:
          - 2181:2181
    kafka:
        image: <%= DOCKER_KAFKA %>
        environment:
            KAFKA_ADVERTISED_HOST_NAME: localhost
            KAFKA_ADVERTISED_PORT: 9092
            KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
            KAFKA_CREATE_TOPICS: "topic-jhipster:1:1"
        ports:
            - 9092:9092
