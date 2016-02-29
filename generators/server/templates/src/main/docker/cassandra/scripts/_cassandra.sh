#!/bin/bash
set -e

if [ "${1:0:1}" = '-' ] || [ "$1" = 'cassandra' ]; then
	/bin/bash -c 'sleep 30 ;/opt/datastax-agent/bin/datastax-agent' &
fi

/docker-entrypoint.sh "$@"
