package <%=packageName%>.repository.search;

import <%=packageName%>.domain.User;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;<% if (databaseType == 'cassandra') { %>

import java.util.UUID;<% } %>

/**
 * Spring Data ElasticSearch repository for the User entity.
 */
public interface UserSearchRepository extends ElasticsearchRepository<User, <% if (databaseType=='sql') { %>Long<% } %><% if (databaseType == 'cassandra' || databaseType=='mongodb') { %>String<% } %>> {
}
