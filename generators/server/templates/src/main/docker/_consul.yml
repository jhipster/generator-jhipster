version: '2'
services:
    consul:
        image: <%= DOCKER_CONSUL %>
        ports:
            - 8300:8300
            - 8500:8500
            - 8600:8600
        command: consul agent -dev -ui -client 0.0.0.0

    consul-config-loader:
        image: <%= DOCKER_CONSUL_CONFIG_LOADER %>
        volumes:
            - ./central-server-config:/config
        environment:
            - INIT_SLEEP_SECONDS=5
            - CONSUL_URL=consul
            - CONSUL_PORT=8500
