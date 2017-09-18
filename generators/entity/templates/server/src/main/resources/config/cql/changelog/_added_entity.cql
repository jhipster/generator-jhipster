<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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

CREATE TABLE IF NOT EXISTS <%= entityInstance %> (
    id uuid,<% for (idx in fields) {
        const fieldType = fields[idx].fieldType;
        const fieldName = fields[idx].fieldName;
        const fieldNameUnderscored = fields[idx].fieldNameUnderscored;
        const fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        if (fieldType === 'UUID') { %>
    <%= fieldName %> uuid,<% } else if (fieldType === 'String') { %>
    <%= fieldName %> text,<% } else if (fieldType === 'Integer') { %>
    <%= fieldName %> int,<% } else if (fieldType === 'Long') { %>
    <%= fieldName %> bigint,<% } else if (fieldType === 'Float') { %>
    <%= fieldName %> float,<% } else if (fieldType === 'Double') { %>
    <%= fieldName %> double,<% } else if (fieldType === 'BigDecimal') { %>
    <%= fieldName %> decimal,<% } else if (fieldType === 'LocalDate') { %>
    <%= fieldName %> date,<% } else if (fieldType === 'Instant') { %>
    <%= fieldName %> timestamp,<% } else if (fieldType === 'ZonedDateTime') { %>
    <%= fieldName %> tuple<timestamp,varchar>,<% } else if (fieldType === 'Boolean') { %>
    <%= fieldName %> boolean,<% } else if (fieldType === 'ByteBuffer') { %>
    <%= fieldName %> blob,<% if (fieldTypeBlobContent !== 'text') { %>
    <%= fieldNameUnderscored %>_content_type text,<% } } } %>
    PRIMARY KEY(id)
);
