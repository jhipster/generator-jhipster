#!/bin/bash

cat /cql/create-keyspace-prod.cql > create-keyspace-tables.cql
echo "USE <%= baseName %>;" >> create-keyspace-tables.cql
cat /cql/create-tables.cql >> create-keyspace-tables.cql

cqlsh -f create-keyspace-tables.cql
