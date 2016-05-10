FROM cassandra:2.2.5

# script to create the keyspace
ADD cassandra/scripts/init-prod.sh /usr/local/bin/init-prod
RUN chmod 755 /usr/local/bin/init-prod

# script to run any cql script from src/main/resources/config/cql
ADD cassandra/scripts/execute-cql.sh  /usr/local/bin/execute-cql
RUN chmod 755 /usr/local/bin/execute-cql
