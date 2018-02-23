#!/bin/bash

set -x
set -m

/entrypoint.sh couchbase-server &

echo "waiting for http://localhost:8091/ui/index.html"
while [ "$(curl -Isw '%{http_code}' -o /dev/null http://localhost:8091/ui/index.html#/)" != 200 ]
do
    sleep 5
done

echo "Setup index and memory quota"
curl -X POST http://127.0.0.1:8091/pools/default -d memoryQuota=300 -d indexMemoryQuota=300

echo "Setup services"
curl http://127.0.0.1:8091/node/controller/setupServices -d services=kv%2Cn1ql%2Cindex

echo "Setup credentials"
curl http://127.0.0.1:8091/settings/web -d port=8091 -d username=Administrator -d password=password

echo "Setup Memory Optimized Indexes"
curl -u Administrator:password -X POST http://127.0.0.1:8091/settings/indexes -d 'storageMode=memory_optimized'

echo "Setup bucket $BUCKET"
curl -u Administrator:password -X POST http://127.0.0.1:8091/pools/default/buckets -d name=$BUCKET -d bucketType=couchbase -d ramQuotaMB=300 -dauthType=sasl

# Load travel-sample bucket
#curl -u Administrator:password -X POST http://127.0.0.1:8091/sampleBuckets/install -d '["travel-sample"]'

echo "Type: $TYPE"

if [ "$TYPE" = "WORKER" ]; then
  echo "Sleeping ..."
  sleep 15

  #IP=`hostname -s`
  IP=`hostname -I | cut -d ' ' -f1`
  echo "IP: " $IP

  echo "Auto Rebalance: $AUTO_REBALANCE"
  if [ "$AUTO_REBALANCE" = "true" ]; then
    couchbase-cli rebalance --cluster=$COUCHBASE_MASTER:8091 --user=Administrator --password=password --server-add=$IP --server-add-username=Administrator --server-add-password=password
  else
    couchbase-cli server-add --cluster=$COUCHBASE_MASTER:8091 --user=Administrator --password=password --server-add=$IP --server-add-username=Administrator --server-add-password=password
  fi;
fi;

fg 1
