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
package <%=packageName%>.repository;

import <%=packageName%>.domain.OAuth2AuthenticationRefreshToken;
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.mongodb.repository.MongoRepository;
<%_ } _%>
<% if (databaseType === 'couchbase') { %>
import static <%=packageName%>.config.Constants.ID_DELIMITER;
<% } %>
/**
 * Spring Data <% if (databaseType === 'couchbase') { %>Couchbase<% } else { %>MongoDB<% } %> repository for the OAuth2AuthenticationRefreshToken entity.
 */
public interface OAuth2RefreshTokenRepository extends <% if (databaseType === 'couchbase') { %>N1qlCouchbaseRepository<% } else { %>MongoRepository<% } %><OAuth2AuthenticationRefreshToken, String> {
<% if (databaseType === 'couchbase') { %>
    default OAuth2AuthenticationRefreshToken findByTokenId(String tokenId) {
        return findOne(OAuth2AuthenticationRefreshToken.PREFIX + ID_DELIMITER + tokenId);
    }
<% } else { %>
    OAuth2AuthenticationRefreshToken findByTokenId(String tokenId);
<% } %>
}
