package <%=packageName%>.repository.search;

import <%=packageName%>.domain.User;
<% if (searchEngine == 'solr') { %>import java.util.List;
import org.springframework.data.solr.repository.SolrCrudRepository;<% } else { %>import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;<% } %>
<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>

/**
 * Spring Data <% if (searchEngine == 'solr') { %>SOLR<% } else { %>ElasticSearch<% } %> repository for the User entity.
 */
public interface UserSearchRepository extends <% if (searchEngine == 'solr') { %>SolrCrudRepository<% } else { %>ElasticsearchRepository<% } %><User, <% if (databaseType=='sql') { %>Long<% } %><% if (databaseType == 'cassandra' || databaseType=='mongodb') { %>String<% } %>> {

    <% if (searchEngine == 'solr') { %>List<User> findByLoginStartingWith(String query);<% } %>

}
