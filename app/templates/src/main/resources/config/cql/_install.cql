--
-- Create <%= baseName %> keyspace
--

SOURCE 'create-keyspace.cql'

USE <%= baseName %>;

SOURCE 'create-tables.cql';
