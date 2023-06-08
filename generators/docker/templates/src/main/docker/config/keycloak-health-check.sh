#!/bin/bash
exec 3<>/dev/tcp/localhost/9080

echo -e "GET /health/ready HTTP/1.1\nhost: localhost:9080\n" >&3

timeout --preserve-status 1 cat <&3 | grep -m 1 status | grep -m 1 UP
ERROR=$?

exec 3<&-
exec 3>&-

exit $ERROR
