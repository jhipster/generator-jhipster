#!/usr/bin/env bash

cqlsh -f /cql/create-keyspace.cql $CASSANDRA_CONTACT_POINT
