FROM mongo:3.2.3
ADD mongodb/scripts/init_replicaset.js init_replicaset.js
