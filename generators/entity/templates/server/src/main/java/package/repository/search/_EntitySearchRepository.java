package <%=packageName%>.repository.search;

import <%=packageName%>.domain.<%=entityClass%>;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;<% if (databaseType == 'cassandra') { %>

import java.util.UUID;<% } %>

/**
 * Spring Data Elasticsearch repository for the <%=entityClass%> entity.
 */
public interface <%=entityClass%>SearchRepository extends ElasticsearchRepository<<%=entityClass%>, <% if (databaseType=='sql' || databaseType=='mongodb') { %>Long<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %>> {
}
