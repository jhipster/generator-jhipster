FROM mongo:3.3.5
ADD mongodb/scripts/init_replicaset.js init_replicaset.js
