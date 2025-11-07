# spring-data generator

Ce générateur orchestre les sous-générateurs Spring Data (SQL, MongoDB, Neo4j, Cassandra, Couchbase) en fonction du `databaseType` de l'application.

Il ne génère pas de fichiers par lui-même, mais délègue à:

- jhipster:spring-data:relational (sql)
- jhipster:spring-data:mongodb
- jhipster:spring-data:neo4j
- jhipster:spring-data:cassandra
- jhipster:spring-data:couchbase
