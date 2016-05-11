FROM cassandra:2.2.5

# install datastax-agent
RUN apt-get update && apt-get install -y curl sysstat
RUN mkdir /opt/datastax-agent
RUN curl -L http://downloads.datastax.com/community/datastax-agent-5.2.2.tar.gz | tar xz --strip-components=1 -C "/opt/datastax-agent"
RUN echo "stomp_interface: opscenter" >> /opt/datastax-agent/conf/address.yaml

# add datastax-agent wrapper entrypoint
ADD cassandra/scripts/cassandra.sh /cassandra.sh
RUN chmod a+x /cassandra.sh

ENTRYPOINT ["/cassandra.sh"]
CMD ["cassandra", "-f"]
