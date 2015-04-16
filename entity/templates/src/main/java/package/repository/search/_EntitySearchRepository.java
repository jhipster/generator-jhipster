package <%=packageName%>.repository.search;

import <%=packageName%>.domain.<%=entityClass%>;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data ElasticSearch repository for the <%=entityClass%> entity.
 */
public interface <%=entityClass%>SearchRepository extends ElasticsearchRepository<<%=entityClass%>, Long> {
}
