--
-- Reset <%= baseName %> keyspace
--

SOURCE 'drop-keyspace.cql'
SOURCE 'create-keyspace.cql'

USE <%= baseName %>;

SOURCE 'create-tables.cql'
