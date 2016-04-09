FROM cassandra:2.2.5

# install datastax-agent
RUN apt-get update && apt-get install -y curl sysstat
RUN mkdir /opt/datastax-agent
RUN curl -L http://downloads.datastax.com/community/datastax-agent-5.2.2.tar.gz | tar xz --strip-components=1 -C "/opt/datastax-agent"
RUN echo "stomp_interface: opscenter" >> /opt/datastax-agent/conf/address.yaml

# add datastax-agent wrapper entrypoint
ADD cassandra/scripts/cassandra.sh /cassandra.sh
RUN chmod a+x /cassandra.sh

# script to create the keyspace and all the basic tables
ADD cassandra/scripts/init-prod.sh /usr/local/bin/init-prod
RUN chmod 755 /usr/local/bin/init-prod

# script to run any cql script from src/main/resources/config/cql
ADD cassandra/scripts/execute-cql.sh  /usr/local/bin/execute-cql
RUN chmod 755 /usr/local/bin/execute-cql

ENTRYPOINT ["/cassandra.sh"]
CMD ["cassandra", "-f"]
