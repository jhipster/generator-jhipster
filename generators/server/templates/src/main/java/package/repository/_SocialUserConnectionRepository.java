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
package <%=packageName%>.repository;

import <%=packageName%>.domain.SocialUserConnection;
<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>
import java.util.List;
import java.util.Set;

/**
 * Spring Data <% if (databaseType == 'sql') { %>JPA<% } else if (databaseType == 'mongodb') { %>MongoDB<% } %> repository for the Social User Connection entity.
 */
public interface SocialUserConnectionRepository extends <% if (databaseType == 'sql') { %>JpaRepository<% } else if (databaseType == 'mongodb') { %>MongoRepository<% } %><SocialUserConnection, <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb') { %>String<% } %>> {

    List<SocialUserConnection> findAllByProviderIdAndProviderUserId(String providerId, String providerUserId);

    List<SocialUserConnection> findAllByProviderIdAndProviderUserIdIn(String providerId, Set<String> providerUserIds);

    List<SocialUserConnection> findAllByUserIdOrderByProviderIdAscRankAsc(String userId);

    List<SocialUserConnection> findAllByUserIdAndProviderIdOrderByRankAsc(String userId, String providerId);

    List<SocialUserConnection> findAllByUserIdAndProviderIdAndProviderUserIdIn(String userId, String providerId, List<String> provideUserId);

    SocialUserConnection findOneByUserIdAndProviderIdAndProviderUserId(String userId, String providerId, String providerUserId);

    void deleteByUserIdAndProviderId(String userId, String providerId);

    void deleteByUserIdAndProviderIdAndProviderUserId(String userId, String providerId, String providerUserId);
}
