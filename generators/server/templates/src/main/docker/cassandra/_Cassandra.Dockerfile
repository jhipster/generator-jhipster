FROM cassandra:2.2.5

# script to initialize the database
ADD cassandra/scripts/init-dev.sh /usr/local/bin/init
RUN chmod 755 /usr/local/bin/init
<%_ if (databaseType == 'cassandra') { _%>

# script to add new tables
ADD cassandra/scripts/entities.sh /usr/local/bin/entities
RUN chmod 755 /usr/local/bin/entities
<%_ } _%>
