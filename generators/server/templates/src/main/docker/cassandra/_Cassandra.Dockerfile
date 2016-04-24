FROM cassandra:2.2.5

# script to orchestrate the automatic keyspace creation and apply all migration scripts
ADD cassandra/scripts/autoMigrate.sh /usr/local/bin/autoMigrate
RUN chmod 755 /usr/local/bin/autoMigrate

# script to create the keyspace and all the basic tables
ADD cassandra/scripts/init-dev.sh /usr/local/bin/init-dev
RUN chmod 755 /usr/local/bin/init-dev

# script to run any cql script from src/main/resources/config/cql
ADD cassandra/scripts/execute-cql.sh  /usr/local/bin/execute-cql
RUN chmod 755 /usr/local/bin/execute-cql

ENTRYPOINT ["autoMigrate"]
