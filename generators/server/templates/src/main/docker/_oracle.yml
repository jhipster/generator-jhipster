version: '2'
services:
    <%= baseName.toLowerCase() %>-oracle:
        image: <%= DOCKER_ORACLE %>
        # volumes:
        #     - ~/volumes/jhipster/<%= baseName %>/oracle/data:/u01/app/oracle
        environment:
            - DBCA_TOTAL_MEMORY=1024
            - WEB_CONSOLE=true
        ports:
            - 1580:8080
            - 1521:1521
