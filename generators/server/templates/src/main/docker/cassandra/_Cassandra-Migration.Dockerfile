<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
FROM <%= DOCKER_CASSANDRA %>

# script to orchestrate the automatic keyspace creation and apply all migration scripts
ADD cassandra/scripts/autoMigrate.sh /usr/local/bin/autoMigrate
RUN chmod 755 /usr/local/bin/autoMigrate

# script to run any cql script from src/main/resources/config/cql
ADD cassandra/scripts/execute-cql.sh  /usr/local/bin/execute-cql
RUN chmod 755 /usr/local/bin/execute-cql

ENTRYPOINT ["autoMigrate"]
