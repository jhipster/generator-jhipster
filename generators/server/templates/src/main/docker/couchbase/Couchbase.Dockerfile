FROM <%= DOCKER_COUCHBASE %>

COPY couchbase/scripts/configure-node.sh /

#HEALTHCHECK --interval=5s --timeout=3s CMD curl --fail http://localhost:8091/pools || exit 1

RUN ["chmod", "+x", "/configure-node.sh"]

ENTRYPOINT ["/configure-node.sh"]
