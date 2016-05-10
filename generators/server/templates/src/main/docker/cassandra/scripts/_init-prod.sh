#!/usr/bin/env bash

cqlsh -f /cql/create-keyspace-prod.cql $CASSANDRA_CONTACT_POINT
