<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
package <%=packageName%>.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceConstructor;
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.mongodb.core.mapping.Document;
<%_ } else { _%>
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.id.GeneratedValue;
import org.springframework.data.couchbase.core.mapping.id.IdAttribute;
import org.springframework.data.couchbase.core.mapping.id.IdPrefix;
<%_ } _%>
import org.springframework.security.oauth2.provider.OAuth2Authentication;

import java.io.Serializable;
<%_ if (databaseType === 'mongodb') { _%>
import java.util.UUID;
<%_ } _%>

<%_ if (databaseType === 'couchbase') { _%>
import static io.github.jhipster.repository.N1qlCouchbaseRepository.DELIMITER;
import static org.springframework.data.couchbase.core.mapping.id.GenerationStrategy.USE_ATTRIBUTES;
<%_ } _%>

@Document<% if (databaseType === 'mongodb') { %>(collection = "OAUTH_AUTHENTICATION_CODE")<% } %>
public class OAuth2AuthenticationCode implements Serializable {

    private static final long serialVersionUID = 1L;
<% if (databaseType === 'couchbase') { %>
    public static final String PREFIX = "authentication_code";

    @SuppressWarnings("unused")
    @IdPrefix
    private String prefix = PREFIX;
<% } %>
    @Id<% if (databaseType === 'couchbase') { %>
    @GeneratedValue(strategy = USE_ATTRIBUTES, delimiter = DELIMITER)<% } %>
    private String id;

    <%_ if (databaseType === 'couchbase') { _%>
    @IdAttribute
    <%_ } _%>
    private String code;

    private OAuth2Authentication authentication;

    @PersistenceConstructor
    public OAuth2AuthenticationCode(String code, OAuth2Authentication authentication) {
        <%_ if (databaseType === 'mongodb') { _%>
        this.id = UUID.randomUUID().toString();
        <%_ } _%>
        this.code = code;
        this.authentication = authentication;
    }

    public String getCode() {
        return code;
    }

    public OAuth2Authentication getAuthentication() {
        return authentication;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) { return true; }
        if (o == null || getClass() != o.getClass()) { return false; }

        OAuth2AuthenticationCode that = (OAuth2AuthenticationCode) o;

        if (id != null ? !id.equals(that.id) : that.id != null) { return false; }

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
