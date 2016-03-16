package <%=packageName%>.config.elasticsearch;

import static org.apache.commons.lang.StringUtils.uncapitalize;

import java.io.Serializable;
import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.data.elasticsearch.repository.ElasticsearchCrudRepository;

public class ElasticSearchUpdater<T> {

    private Logger logger = LoggerFactory.getLogger(getClass());

    private static BeanFactory beanFactory;

    @PostPersist
    @PostUpdate
    public void saveInElasticSearch(T entity) {
        ElasticsearchCrudRepository<T, Serializable> repository = repositoryFor(entity);
        if (repository != null) {
            logger.debug("Saving entity in ES : {}", entity);
            repository.save(entity);
            logger.debug("Saved entity in ES : {}", entity);
        }
    }

    @PostRemove
    public void removeFromElasticSearch(T entity) {
        ElasticsearchCrudRepository<T, Serializable> repository = repositoryFor(entity);
        if (repository != null) {
            logger.debug("Removing entity from ES : {}", entity);
            repository.delete(entity);
            logger.debug("Removed entity from ES : {}", entity);
        }
    }

    @SuppressWarnings("unchecked")
    private ElasticsearchCrudRepository<T, Serializable> repositoryFor(T entity) {
        String repositoryName = repositoryNameFor(entity);
    
        ElasticsearchCrudRepository<T, Serializable> repository = null;
        try {
            repository = beanFactory.getBean(repositoryName, ElasticsearchCrudRepository.class);
        } catch (NoSuchBeanDefinitionException e) {
            logger.debug("No ElasticSearch repository found with name '{}'", repositoryName);
        }
        return repository;
    }

    private String repositoryNameFor(T entity) {
        String entityName = entity.getClass().getSimpleName();
        return uncapitalize(entityName) + "SearchRepository";
    }

    static void setBeanFactory(BeanFactory beanFactory) {
        ElasticSearchUpdater.beanFactory = beanFactory;
    }
}
