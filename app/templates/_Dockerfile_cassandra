FROM cassandra:2.2.3
MAINTAINER Pascal Grimaud <pascalgrimaud@gmail.com>

# install datastax-agent
RUN apt-get update && apt-get install -y curl sysstat
RUN mkdir /opt/datastax-agent
RUN curl -L http://downloads.datastax.com/community/datastax-agent-5.2.2.tar.gz | tar xz --strip-components=1 -C "/opt/datastax-agent"
RUN echo "stomp_interface: opscenter" >> /opt/datastax-agent/conf/address.yaml

# add datastax-agent wrapper entrypoint
ADD docker/cassandra/cassandra.sh /cassandra.sh
RUN chmod a+x /cassandra.sh

# add script cql
ADD src/main/resources/config/cql/create-keyspace.cql /create-keyspace.cql
ADD src/main/resources/config/cql/create-tables.cql /create-tables.cql

# concat 2 scripts to 1
RUN cat create-keyspace.cql > create-keyspace-tables.cql
RUN echo "USE <%=baseName%>;" >> create-keyspace-tables.cql
RUN cat create-tables.cql >> create-keyspace-tables.cql

# init, for easier docker exec
RUN echo "#!/bin/bash" > /usr/local/bin/init
RUN echo "cqlsh -f create-keyspace-tables.cql" >> /usr/local/bin/init
RUN chmod 755 /usr/local/bin/init

ENTRYPOINT ["/cassandra.sh"]
CMD ["cassandra", "-f"]
