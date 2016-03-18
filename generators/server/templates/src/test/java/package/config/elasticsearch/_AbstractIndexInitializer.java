package <%=packageName%>.config.elasticsearch;

import static java.lang.System.currentTimeMillis;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;

public abstract class AbstractIndexInitializer {

    private Logger logger = LoggerFactory.getLogger(getClass());
    @Inject
    private ElasticsearchTemplate elasticsearchTemplate;
    private Class<?> entityClass;

    public AbstractIndexInitializer(Class<?> entityClass) {
        this.entityClass = entityClass;
    }

    public void resetIndex() {
        long t = currentTimeMillis();
        elasticsearchTemplate.deleteIndex(entityClass);
        elasticsearchTemplate.createIndex(entityClass);
        elasticsearchTemplate.putMapping(entityClass);
        t = currentTimeMillis() - t;
        logger.debug("{} ElasticSearch index reset in {} ms", entityClass.getSimpleName(), t);
    }
}
